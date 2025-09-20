import React, { useMemo, useState } from "react";
import Hyperspeed from "@/components/Hyperspeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { BarChart as BarChartComponent } from "@/components/charts/BarChart";
import { LineChart as LineChartComponent } from "@/components/charts/LineChart";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

type Tx = { id: string; category: string; amount: number; description: string; time: string };

function DailySection() {
  const transactions: Array<Tx> = [
    { id: "t1", category: "Groceries", amount: 24.75, description: "Trader Joe's", time: "08:45" },
    { id: "t2", category: "Coffee", amount: 4.25, description: "Latte", time: "10:10" },
    { id: "t3", category: "Transport", amount: 13.0, description: "Metro card", time: "12:05" },
    { id: "t4", category: "Dining", amount: 18.5, description: "Lunch", time: "13:20" },
    { id: "t5", category: "Subscriptions", amount: 9.99, description: "Cloud storage", time: "18:40" },
  ];
  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
  const numTx = transactions.length;
  const highest = transactions.reduce((m, t) => Math.max(m, t.amount), 0);
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) map[t.category] = (map[t.category] ?? 0) + t.amount;
    return map;
  }, [transactions]);
  const yesterdaySpent = Math.max(0, Math.round(totalSpent * 0.78 * 100) / 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-4 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-sm" style={{ color: "#7F8C8D" }}>Total Spent Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: "#2C3E50" }}>${totalSpent.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-4 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-sm" style={{ color: "#7F8C8D" }}>Number of Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: "#2C3E50" }}>{numTx}</div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-4 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-sm" style={{ color: "#7F8C8D" }}>Highest Single Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: "#2C3E50" }}>${highest.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-7 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>Today's Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-[#E8E8E8] bg-white/70 overflow-hidden">
            <div className="grid grid-cols-6 px-4 py-2 text-xs font-medium" style={{ color: "#7F8C8D" }}>
              <div>Time</div>
              <div>Category</div>
              <div className="col-span-2">Description</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Actions</div>
            </div>
            <Separator />
            <div className="divide-y" style={{ borderColor: "#E8E8E8" }}>
              {transactions.map((t) => (
                <div key={t.id} className="grid grid-cols-6 px-4 py-3 text-sm">
                  <div style={{ color: "#7F8C8D" }}>{t.time}</div>
                  <div style={{ color: "#2C3E50" }}>{t.category}</div>
                  <div className="col-span-2" style={{ color: "#2C3E50" }}>{t.description}</div>
                  <div className="text-right font-semibold" style={{ color: "#2C3E50" }}>${t.amount.toFixed(2)}</div>
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <Button variant="outline" className="h-7 px-2 border-[#E8E8E8] bg-white/60 text-xs shrink-0" onClick={() => console.log("Edit", t.id)}>Edit</Button>
                    <Button variant="outline" className="h-7 px-2 border-red-300 text-red-600 bg-red-50/60 text-xs shrink-0" onClick={() => console.log("Delete", t.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-5 grid gap-6">
        <Card className="border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
          <CardHeader>
            <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(byCategory).map(([cat, amt]) => {
                const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "#2C3E50" }}>{cat}</span>
                      <span className="text-xs" style={{ color: "#7F8C8D" }}>
                        ${amt.toFixed(2)} • {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F5F3F0] border border-[#E8E8E8] overflow-hidden mt-1">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#2C3E50" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
          <CardHeader>
            <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>Compared to Yesterday</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 items-end h-24">
              <div className="flex flex-col items-center">
                <div className="w-10 rounded-xl bg-[#F5F3F0] border border-[#E8E8E8] overflow-hidden" title={`$${yesterdaySpent.toFixed(2)}`}>
                  <div className="w-full rounded-xl" style={{ height: "60%", background: "#2C3E50" }} />
                </div>
                <div className="text-xs mt-1" style={{ color: "#7F8C8D" }}>Yesterday</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 rounded-xl bg-[#F5F3F0] border border-[#E8E8E8] overflow-hidden" title={`$${totalSpent.toFixed(2)}`}>
                  <div className="w-full rounded-xl" style={{ height: "85%", background: "#F4D03F" }} />
                </div>
                <div className="text-xs mt-1" style={{ color: "#7F8C8D" }}>Today</div>
              </div>
            </div>
            <div className="text-xs mt-3" style={{ color: "#7F8C8D" }}>
              Change:{" "}
              <span className="font-medium" style={{ color: "#2C3E50" }}>
                {yesterdaySpent === 0 ? "+100%" : `${(((totalSpent - yesterdaySpent) / Math.max(1e-6, yesterdaySpent)) * 100).toFixed(1)}%`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MonthlySection() {
  const monthlyCategories = [
    { category: "Food & Dining", amount: 680 },
    { category: "Transportation", amount: 420 },
    { category: "Shopping", amount: 350 },
    { category: "Entertainment", amount: 280 },
    { category: "Bills & Utilities", amount: 260 },
  ];
  const trend = [
    { label: "Week 1", value: 420 },
    { label: "Week 2", value: 580 },
    { label: "Week 3", value: 690 },
    { label: "Week 4", value: 540 },
  ];
  const total = monthlyCategories.reduce((s, c) => s + c.amount, 0);
  const lastMonth = Math.round(total * 0.92);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-4 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-sm" style={{ color: "#7F8C8D" }}>Total This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: "#2C3E50" }}>${total.toLocaleString()}</div>
          <div className="text-xs mt-1" style={{ color: "#7F8C8D" }}>
            vs last month: <span className="font-medium" style={{ color: "#2C3E50" }}>
              {(((total - lastMonth) / Math.max(1e-6, lastMonth)) * 100).toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-8 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartComponent data={monthlyCategories as any} xKey="category" yKey="amount" color="#3b82f6" height={300} />
        </CardContent>
      </Card>
      <Card className="lg:col-span-12 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChartComponent
            points={trend.map((d, i) => ({ x: i, y: d.value }))}
            height={280}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function YearlySection() {
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2025, i, 1).toLocaleString(undefined, { month: "short" }),
    value: Math.round(400 + Math.random() * 600),
  }));
  const byCategory = [
    { category: "Housing", amount: 8200 },
    { category: "Food & Dining", amount: 5200 },
    { category: "Transportation", amount: 2800 },
    { category: "Utilities", amount: 2200 },
    { category: "Entertainment", amount: 1600 },
  ];
  const total = byCategory.reduce((s, c) => s + c.amount, 0);
  const lastYear = Math.round(total * 0.97);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-4 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-sm" style={{ color: "#7F8C8D" }}>Total This Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: "#2C3E50" }}>${total.toLocaleString()}</div>
          <div className="text-xs mt-1" style={{ color: "#7F8C8D" }}>
            vs last year: <span className="font-medium" style={{ color: "#2C3E50" }}>
              {(((total - lastYear) / Math.max(1e-6, lastYear)) * 100).toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-8 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>Category Share</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartComponent data={byCategory as any} xKey="category" yKey="amount" color="#8b5cf6" height={300} />
        </CardContent>
      </Card>
      <Card className="lg:col-span-12 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChartComponent
            points={monthlyTrend.map((d, i) => ({ x: i, y: d.value }))}
            height={280}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SuggestionsPanel() {
  const latest = useQuery(api.aiData.getLatestInsight) as any;
  const analyze = useAction(api.ai.analyzeUser);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!question.trim()) {
      toast("Please enter a question.");
      return;
    }
    setIsSubmitting(true);
    try {
      await analyze({ promptKind: "reports_chat", userQuestion: question });
      toast("Generating personalized advice...");
      setQuestion("");
    } catch (e: any) {
      toast(`AI error: ${e.message || "Failed to generate advice"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cards = [
    { id: "s1", title: "Budget Alert", body: "Dining spend is trending higher than usual today." },
    { id: "s2", title: "Quick Save", body: "Consider brewing coffee at home to save $40/month." },
    { id: "s3", title: "Investment Nudge", body: "You could auto-transfer $100 to savings this payday." },
  ];

  return (
    <div className="space-y-4">
      {cards.map((c) => (
        <Card key={c.id} className="border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
          <CardHeader>
            <CardTitle className="text-sm" style={{ color: "#2C3E50" }}>{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: "#2C3E50" }}>{c.body}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button className="text-[#2C3E50]" style={{ background: "#F4D03F" }} onClick={() => setOpen(true)}>Chat with AI</Button>
              <Button variant="outline" className="border-[#E8E8E8] bg-white/60 text-xs">Useful</Button>
              <Button variant="outline" className="border-[#E8E8E8] bg-white/60 text-xs">Ignore</Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg bg-white/80 backdrop-blur-[9px]">
          <DialogHeader>
            <DialogTitle style={{ color: "#2C3E50" }}>Ask the AI Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask for actionable tips (e.g., How to reduce Food expenses today?)"
              className="w-full min-h-[100px] rounded-lg border border-[#E8E8E8] bg-white/70 p-3"
            />
            <div className="rounded-lg border border-[#E8E8E8] bg-white/70 p-3 max-h-48 overflow-auto">
              <div className="text-xs mb-2" style={{ color: "#7F8C8D" }}>Latest Insight</div>
              <div className="text-sm whitespace-pre-wrap" style={{ color: "#2C3E50" }}>
                {latest?.structured
                  ? latest.structured
                  : (latest?.content || "No insights yet. Ask a question to get started.")}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[#E8E8E8] bg-white/60" onClick={() => setOpen(false)}>Close</Button>
            <Button disabled={isSubmitting} className="text-[#2C3E50]" style={{ background: "#F4D03F" }} onClick={submit}>
              {isSubmitting ? "Asking..." : "Ask"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Reports() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"daily" | "monthly" | "yearly">("daily");

  const titleDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit", weekday: "short" });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <Hyperspeed className="opacity-60" />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)" }}
      />

      <div className="sticky top-0 z-10 backdrop-blur-[9px] bg-white/30 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-xs" style={{ color: "#7F8C8D" }}>Home &gt; Reports</div>
            <h1 className="text-xl font-bold" style={{ color: "#2C3E50" }}>Reports &amp; Insights</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E8E8E8] bg-white/60" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-4 flex items-center gap-2 text-xs" style={{ color: "#7F8C8D" }}>
          <span>{titleDate}</span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 bg-white/50 border border-[#E8E8E8] rounded-xl p-1">
          {[
            { key: "daily", label: "Daily" },
            { key: "monthly", label: "Monthly" },
            { key: "yearly", label: "Yearly" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                tab === t.key ? "bg-white text-black shadow" : "text-foreground/70 hover:text-foreground hover:bg-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {tab === "daily" && <DailySection />}
            {tab === "monthly" && <MonthlySection />}
            {tab === "yearly" && <YearlySection />}
          </div>
          <div className="lg:col-span-4">
            <div className="sticky top-[88px] space-y-4">
              <Card className="border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>
                    Suggestions &amp; Investments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SuggestionsPanel />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-between">
          <div className="flex gap-3">
            <Button className="text-[#2C3E50]" style={{ background: "#F4D03F" }} onClick={() => navigate("/dashboard")}>
              Add Expense
            </Button>
            <Button
              variant="outline"
              className="border-[#E8E8E8] bg-white/60"
              onClick={() => window.print()}
            >
              Export PDF
            </Button>
          </div>
          <Button variant="outline" className="border-[#E8E8E8] bg-white/60" onClick={() => navigate("/reports/daily")}>
            Open Daily Report (Full Page)
          </Button>
        </div>
      </div>
    </div>
  );
}
