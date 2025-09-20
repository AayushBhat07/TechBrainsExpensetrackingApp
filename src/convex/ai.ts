"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Minimal OpenRouter-compatible call
async function callLLM({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
}: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}) {
  const resp = await fetch("https://api.openrouter.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://split-cost-now.local",
      "X-Title": "MoneyTalks AI Coach",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`LLM request failed: ${resp.status} ${txt}`);
  }
  const data = await resp.json();
  const content =
    data?.choices?.[0]?.message?.content ??
    "No content generated. Please try again.";
  return content as string;
}

// Public action: Analyze current user and persist insights
export const analyzeUser = action({
  args: {
    promptKind: v.optional(v.string()), // e.g., "spending_analysis" | "knowledge_gaps" | "motivational" | "predictions"
    model: v.optional(v.string()), // override model id if desired
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENROUTER_API_KEY. Please add the OpenRouter integration and set the API key."
      );
    }

    const context = await ctx.runQuery(internal.aiData.getUserContext, {});
    const selectedModel = args.model ?? "mistralai/mistral-7b-instruct";

    const systemPrompt =
      "You are a highly experienced personal financial advisor and behavioral economist. Provide supportive, actionable, and tailored guidance based on user context.";

    // Build user prompt requesting strictly-JSON output
    const userPrompt = [
      "Analyze the following user's financial profile and summarized spending.",
      "",
      "USER CONTEXT (JSON):",
      JSON.stringify(context, null, 2),
      "",
      "Return ONLY JSON (no extra commentary) with a single root key 'spending_analysis' containing:",
      "- overall_health_score (1-10)",
      "- overspending_alerts: array of objects with keys:",
      '  category (string), severity ("low"|"moderate"|"high"), actual_amount (number), recommended_amount (number), percentage_over (number), impact_on_goal (string), personalized_message (string)',
      "- positive_patterns: array of { category: string, message: string }",
      "- recommendations: array of 3-5 short actionable strings",
    ].join("\n");

    const content = await callLLM({
      apiKey,
      model: selectedModel,
      systemPrompt,
      userPrompt,
    });

    // Try to extract and parse JSON (handle possible code fences)
    let structured: string | undefined;
    try {
      let raw = content.trim();
      const fenceStart = raw.indexOf("
");
      if (fenceStart > 0) {
        raw = raw.slice(fenceStart + 1);
      }
      const fenceEnd = raw.lastIndexOf("
");
      if (fenceEnd > 0) {
        raw = raw.slice(0, fenceEnd);
      }
      structured = raw;
      const parsed = JSON.parse(structured);
      return parsed;
    } catch (e) {
      throw new Error("Failed to parse LLM response as JSON");
    }
  },
});