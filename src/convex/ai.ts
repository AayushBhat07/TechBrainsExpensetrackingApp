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
    promptKind: v.optional(v.string()), // e.g., "spending_analysis"
    model: v.optional(v.string()),
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
      "You are a highly experienced personal financial advisor and behavioral economist. Provide supportive, actionable, and tailored guidance based on user context. Always return valid JSON.";

    const userContextJson = JSON.stringify(context, null, 2);

    const userPrompt = `
Analyze the following user's financial profile and summarized spending.

USER CONTEXT (JSON):
${userContextJson}

RESPONSE FORMAT (strict JSON):
{
  "analysis": "Comprehensive financial analysis of the user's current situation and spending patterns.",
  "recommendations": "Actionable, personalized financial recommendations based on the analysis.",
  "confidence": "Confidence level in the analysis (0-100%)"
}

Only output valid JSON for the final answer, no extra text.
`.trim();

    const content = await callLLM({
      apiKey,
      model: selectedModel,
      systemPrompt,
      userPrompt,
    });

    // Try to parse JSON; if fails, still persist raw content for visibility
    let structured: string | undefined = undefined;
    try {
      const parsed = JSON.parse(content);
      structured = JSON.stringify(parsed);
    } catch {
      // Leave structured undefined; consumer can show raw content
    }

    // Persist the result as a user insight (best-effort)
    try {
      await ctx.runMutation(internal.aiData.saveInsight, {
        content,
        structured,
        promptKind: args.promptKind ?? "spending_analysis",
        model: selectedModel,
      });
    } catch (e) {
      // Do not block action on save failure; surface minimal info
      console.warn("Failed to save AI insight:", e);
    }

    // Return parsed JSON if possible; otherwise return an object with raw content
    if (structured) {
      return JSON.parse(structured);
    }
    return { analysis: content, recommendations: "", confidence: "N/A" };
  },
});