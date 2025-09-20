import React from "react";
import { Brain, Sparkles, Tag } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type Suggested = {
  id: string;
  description: string;
  amount: number;
  detected: string;
  confidence: number; // 0-1
  suggestion: string;
};

export const SmartCategorizationSection: React.FC = () => {
  const suggestions: Suggested[] = [
    { id: "t1", description: "Blue Bottle Coffee", amount: 7.5, detected: "Dining", confidence: 0.92, suggestion: "Food & Dining" },
    { id: "t2", description: "Lyft Ride", amount: 18.2, detected: "Transportation", confidence: 0.88, suggestion: "Transportation" },
    { id: "t3", description: "Amazon Purchase", amount: 42.0, detected: "Shopping", confidence: 0.76, suggestion: "Shopping" },
  ];

  return (
    <div className="space-y-6">
      <GlassCard size="responsive" variant="data">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-6 h-6 mr-3 text-purple-600" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Smart Categorization</h2>
              <p className="text-muted-foreground">
                AI-powered suggestions with confidence scores
              </p>
            </div>
          </div>
          <button className="inline-flex items-center px-3 py-2 rounded-lg border border-purple-500/40 bg-purple-500/20 hover:bg-purple-500/30 transition">
            <Sparkles className="w-4 h-4 mr-2" />
            Re-run Suggestions
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {suggestions.map((s) => (
          <GlassCard key={s.id} size="responsive" className="flex items-center justify-between">
            <div>
              <div className="font-medium">{s.description}</div>
              <div className="text-sm text-muted-foreground">${s.amount.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Detected: <span className="font-medium">{s.detected}</span> • Confidence:{" "}
                <span className={`font-semibold ${s.confidence > 0.85 ? "text-emerald-600" : s.confidence > 0.7 ? "text-yellow-600" : "text-red-500"}`}>
                  {(s.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <button className="inline-flex items-center px-3 py-2 rounded-lg border bg-black/10 hover:bg-black/20 transition">
              <Tag className="w-4 h-4 mr-2" />
              Apply {s.suggestion}
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
