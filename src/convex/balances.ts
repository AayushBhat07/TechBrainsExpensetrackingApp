import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Calculate detailed balances between all group members
export const getGroupBalances = query({
  args: { groupId: v.id("groups") },
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

    // Get all group members
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const memberUser = await ctx.db.get(membership.userId);
        return memberUser;
      })
    );

    const validMembers = members.filter(Boolean);

    // Calculate balances for each member
    const memberBalances = await Promise.all(
      validMembers.map(async (member) => {
        // Get expenses this member paid for
        const expensesPaid = await ctx.db
          .query("expenses")
          .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
          .filter((q) => q.eq(q.field("paidBy"), member!._id))
          .collect();

        const totalPaid = expensesPaid.reduce((sum, expense) => sum + expense.amount, 0);

        // Get splits this member owes
        const memberSplits = await ctx.db
          .query("expenseSplits")
          .withIndex("by_user", (q) => q.eq("userId", member!._id))
          .collect();

        // Filter for this group's expenses
        const groupSplits = await Promise.all(
          memberSplits.map(async (split) => {
            const expense = await ctx.db.get(split.expenseId);
            return expense?.groupId === args.groupId ? split : null;
          })
        );

        const validSplits = groupSplits.filter(Boolean);
        const totalOwed = validSplits.reduce((sum, split) => sum + (split?.amount || 0), 0);

        return {
          user: member,
          totalPaid,
          totalOwed,
          balance: totalPaid - totalOwed,
        };
      })
    );

    // Calculate who owes whom
    const settlements = [];
    const balances = memberBalances.map(mb => ({ ...mb })); // Copy for manipulation

    // Sort by balance (creditors first, then debtors)
    balances.sort((a, b) => b.balance - a.balance);

    let i = 0; // Creditors (positive balance)
    let j = balances.length - 1; // Debtors (negative balance)

    while (i < j) {
      const creditor = balances[i];
      const debtor = balances[j];

      if (creditor.balance <= 0) break;
      if (debtor.balance >= 0) break;

      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
      
      if (amount > 0.01) { // Avoid tiny amounts due to floating point
        settlements.push({
          from: debtor.user,
          to: creditor.user,
          amount: Math.round(amount * 100) / 100,
        });

        creditor.balance -= amount;
        debtor.balance += amount;
      }

      if (Math.abs(creditor.balance) < 0.01) i++;
      if (Math.abs(debtor.balance) < 0.01) j--;
    }

    return {
      memberBalances: memberBalances.map(mb => ({
        ...mb,
        balance: Math.round(mb.balance * 100) / 100,
      })),
      settlements,
    };
  },
});

// Get spending insights for a group
export const getSpendingInsights = query({
  args: { 
    groupId: v.id("groups"),
    month: v.optional(v.string()), // YYYY-MM format
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

    // Calculate date range
    const now = new Date();
    const targetMonth = args.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, month] = targetMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 0, 23, 59, 59).getTime();

    // Get expenses for the period
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group_and_date", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.gte(q.field("date"), startDate) && q.lte(q.field("date"), endDate))
      .collect();

    // Calculate spending by category
    const categorySpending = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate daily spending
    const dailySpending = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      month: targetMonth,
      totalSpending: Math.round(totalSpending * 100) / 100,
      expenseCount: expenses.length,
      categorySpending,
      dailySpending,
      averageExpense: expenses.length > 0 ? Math.round((totalSpending / expenses.length) * 100) / 100 : 0,
    };
  },
});
