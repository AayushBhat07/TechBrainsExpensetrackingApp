import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("recurringPayments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return rows;
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    amount: v.number(),
    frequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("annually"),
    ),
    nextDue: v.number(),
    autoPayEnabled: v.boolean(),
    merchant: v.optional(v.string()),
    accountLinked: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const id = await ctx.db.insert("recurringPayments", {
      userId: user._id,
      name: args.name,
      category: args.category,
      amount: args.amount,
      frequency: args.frequency,
      nextDue: args.nextDue,
      status: "active",
      autoPayEnabled: args.autoPayEnabled,
      merchant: args.merchant,
      accountLinked: args.accountLinked,
      totalPaidThisYear: 0,
    });
    return id;
  },
});

export const toggleStatus = mutation({
  args: { id: v.id("recurringPayments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== user._id) throw new Error("Not found");
    const next =
      row.status === "active" ? "paused" : row.status === "paused" ? "active" : "active";
    await ctx.db.patch(args.id, { status: next });
  },
});

export const remove = mutation({
  args: { id: v.id("recurringPayments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
