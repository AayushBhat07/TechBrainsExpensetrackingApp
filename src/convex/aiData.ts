import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Internal: Assemble user context for AI
export const getUserContext = internalQuery({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Profile
    const profile =
      (await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique()) ?? null;

    // Basic spending aggregates by category based on expenses the user paid
    // (minimal and efficient via index)
    const byCategory: Record<string, number> = {};
    for await (const exp of ctx.db
      .query("expenses")
      .withIndex("by_payer", (q) => q.eq("paidBy", user._id))) {
      const c = exp.category as string;
      byCategory[c] = (byCategory[c] ?? 0) + exp.amount;
    }

    // Build a small, safe context object
    const context = {
      user_profile: profile,
      transaction_data: {
        category_totals_by_paidBy: byCategory,
      },
    };

    return context;
  },
});

// Internal: Save an AI insight
export const saveInsight = internalMutation({
  args: {
    content: v.string(),
    structured: v.optional(v.string()),
    promptKind: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    return await ctx.db.insert("userInsights", {
      userId: user._id,
      content: args.content,
      structured: args.structured,
      promptKind: args.promptKind,
      model: args.model,
    });
  },
});

// Public: Latest insight for current user
export const getLatestInsight = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // Return most recent by iteration since default order is _creationTime asc
    let latest: any = null;
    for await (const row of ctx.db
      .query("userInsights")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")) {
      latest = row;
      break;
    }
    return latest;
  },
});
