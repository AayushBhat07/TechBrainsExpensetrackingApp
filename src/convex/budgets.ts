import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator } from "./schema";

export const upsert = mutation({
  args: {
    groupId: v.id("groups"),
    category: categoryValidator,
    month: v.string(), // YYYY-MM
    monthlyLimit: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_group_category_month", (q) =>
        q.eq("groupId", args.groupId).eq("category", args.category).eq("month", args.month),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { monthlyLimit: args.monthlyLimit });
      return existing._id;
    }
    return await ctx.db.insert("budgets", {
      groupId: args.groupId,
      category: args.category,
      monthlyLimit: args.monthlyLimit,
      month: args.month,
      createdBy: user._id,
    });
  },
});

export const getForGroupMonth = query({
  args: { groupId: v.id("groups"), month: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("budgets")
      .withIndex("by_group_and_month", (q) => q.eq("groupId", args.groupId).eq("month", args.month))
      .collect();
    return rows;
  },
});
