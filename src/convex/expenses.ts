import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator } from "./schema";

// Create a new expense
export const create = mutation({
  args: {
    groupId: v.id("groups"),
    title: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    category: categoryValidator,
    receiptUrl: v.optional(v.id("_storage")),
    splitAmounts: v.array(v.object({
      userId: v.id("users"),
      amount: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    // Verify user is a member of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    // Validate split amounts sum to total
    const totalSplit = args.splitAmounts.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplit - args.amount) > 0.01) {
      throw new Error("Split amounts must sum to total expense amount");
    }

    // Create expense
    const expenseId = await ctx.db.insert("expenses", {
      groupId: args.groupId,
      title: args.title,
      description: args.description,
      amount: args.amount,
      category: args.category,
      paidBy: user._id,
      receiptUrl: args.receiptUrl,
      date: Date.now(),
      isSettled: false,
    });

    // Create expense splits
    for (const split of args.splitAmounts) {
      await ctx.db.insert("expenseSplits", {
        expenseId,
        userId: split.userId,
        amount: split.amount,
        isPaid: split.userId === user._id, // Payer is automatically marked as paid
      });
    }

    return expenseId;
  },
});

// Get expenses for a group
export const getGroupExpenses = query({
  args: { 
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    // Verify user is a member of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group_and_date", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(args.limit || 50);

    // Get additional details for each expense
    const expensesWithDetails = await Promise.all(
      expenses.map(async (expense) => {
        const paidByUser = await ctx.db.get(expense.paidBy);
        
        // Get splits for this expense
        const splits = await ctx.db
          .query("expenseSplits")
          .withIndex("by_expense", (q) => q.eq("expenseId", expense._id))
          .collect();

        const splitsWithUsers = await Promise.all(
          splits.map(async (split) => {
            const splitUser = await ctx.db.get(split.userId);
            return {
              ...split,
              user: splitUser,
            };
          })
        );

        return {
          ...expense,
          paidByUser,
          splits: splitsWithUsers,
        };
      })
    );

    return expensesWithDetails;
  },
});

// Get user's balance in a group
export const getUserBalance = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    // Get all expenses user paid for
    const expensesPaid = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("paidBy"), user._id))
      .collect();

    const totalPaid = expensesPaid.reduce((sum, expense) => sum + expense.amount, 0);

    // Get all splits user owes
    const userSplits = await ctx.db
      .query("expenseSplits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Filter splits for expenses in this group
    const groupSplits = await Promise.all(
      userSplits.map(async (split) => {
        const expense = await ctx.db.get(split.expenseId);
        return expense?.groupId === args.groupId ? split : null;
      })
    );

    const validSplits = groupSplits.filter(Boolean);
    const totalOwed = validSplits.reduce((sum, split) => sum + (split?.amount || 0), 0);

    return {
      totalPaid,
      totalOwed,
      balance: totalPaid - totalOwed,
    };
  },
});

// Mark expense split as paid
export const markSplitPaid = mutation({
  args: {
    expenseId: v.id("expenses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const split = await ctx.db
      .query("expenseSplits")
      .withIndex("by_expense_and_user", (q) => 
        q.eq("expenseId", args.expenseId).eq("userId", args.userId)
      )
      .unique();

    if (!split) {
      throw new Error("Split not found");
    }

    await ctx.db.patch(split._id, { isPaid: true });
  },
});
