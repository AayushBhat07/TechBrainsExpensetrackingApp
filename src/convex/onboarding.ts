import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return existing ?? null;
  },
});

export const saveProfile = mutation({
  args: {
    financialGoal: v.optional(v.string()),
    spendingPersonality: v.optional(v.string()),
    motivationType: v.optional(v.string()),
    monthlyIncome: v.optional(v.string()),
    spendingConfidence: v.optional(v.number()),
    problemCategories: v.optional(v.array(v.string())),
    collaborationType: v.optional(v.string()),
    preferredCategories: v.optional(v.array(v.string())),
    bankConnected: v.optional(v.boolean()),
    autoAlerts: v.optional(v.boolean()),
    emergencyMonths: v.optional(v.number()),
    majorPurchaseAmount: v.optional(v.number()),
    majorPurchaseTimeline: v.optional(v.string()),
    debtAmount: v.optional(v.number()),
    debtType: v.optional(v.string()),
    typicalSpending: v.optional(v.number()),
    essentialsPct: v.optional(v.number()),
    onboardingStep: v.optional(v.number()),
    onboardingQStep: v.optional(v.number()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!existing) {
      return await ctx.db.insert("userProfiles", {
        userId: user._id,
        ...args,
        completedAt: args.onboardingCompleted ? Date.now() : undefined,
      });
    }

    await ctx.db.patch(existing._id, {
      ...args,
      completedAt: args.onboardingCompleted ? Date.now() : existing.completedAt,
    });
    return existing._id;
  },
});