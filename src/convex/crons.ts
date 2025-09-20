import { cronJobs } from "convex/server";
import { internal, api } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";

// Internal query: list all user IDs (no PII exposure here)
export const listUserIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const ids: Array<string> = [];
    for await (const u of ctx.db.query("users")) {
      ids.push(u._id);
    }
    return ids;
  },
});

// Internal action: for each user, generate 3 insights
export const dailyGenerateInsights = internalAction({
  args: {},
  handler: async (ctx) => {
    const userIds = await ctx.runQuery(internal.crons.listUserIds, {});
    // Three prompt kinds for variety
    const kinds: Array<string> = [
      "spending_analysis",
      "knowledge_gaps",
      "motivational",
    ];

    // Fire sequentially per user to keep API usage predictable
    for (const _ of userIds) {
      for (const k of kinds) {
        try {
          await ctx.runAction(api.ai.analyzeUser, { promptKind: k });
        } catch (e) {
          console.error("AI insight generation failed:", k, e);
        }
      }
    }
  },
});

const crons = cronJobs();

// Run once every 24 hours
crons.interval(
  "generate daily ai insights",
  { hours: 24 },
  internal.crons.dailyGenerateInsights,
  {}
);

export default crons;
