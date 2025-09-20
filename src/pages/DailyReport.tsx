import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import Hyperspeed from "@/components/Hyperspeed";

type Tx = { id: string; category: string; amount: number; description: string; time: string };

export default function DailyReport() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      weekday: "short",
    });
  }, []);

  // Demo transactions for the day (replace with Convex query later)
  const transactions: Array<Tx> = [
    { id: "t1", category: "Groceries", amount: 24.75, description: "Trader Joe's", time: "08:45" },
    { id: "t2", category: "Coffee", amount: 4.25, description: "Latte", time: "10:10" },
    { id: "t3", category: "Transport", amount: 13.0, description: "Metro card", time: "12:05" },
    { id: "t4", category: "Dining", amount: 18.5, description: "Lunch", time: "13:20" },
    { id: "t5", category: "Subscriptions", amount: 9.99, description: "Cloud storage", time: "18:40" },
  ];

  // Quick stats
  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
  const numTx = transactions.length;
  const highest = transactions.reduce((m, t) => Math.max(m, t.amount), 0);

  // Category breakdown
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) map[t.category] = (map[t.category] ?? 0) + t.amount;
    return map;
  }, [transactions]);

  const topCategory = useMemo(() => {
    let name = "—";
    let max = -Infinity;
    for (const [k, v] of Object.entries(byCategory)) {
      if (v > max) {
        max = v;
        name = k;
      }
    }
    return name;
  }, [byCategory]);

  // Comparison vs yesterday (demo numbers)
  const yesterdaySpent = Math.max(0, Math.round(totalSpent * 0.78 * 100) / 100);

  // Export CSV from demo data
  const exportCSV = () => {
    const header = ["id", "category", "amount", "description", "time"].join(",");
    // Replace replaceAll with regex for broader TS target support
    const rows = transactions.map((t) =>
      [t.id, t.category, t.amount.toFixed(2), `"${t.description.replace(/"/g, '""')}"`, t.time].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add: Export PDF via print dialog
  const exportPDF = () => {
    window.print();
  };

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
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)",
        }}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-[9px] bg-white/30 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-xs" style={{ color: "#7F8C8D" }}>
              Home &gt; Reports &gt; Daily Report
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#2C3E50" }}>
              Daily Report – {today}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E8E8E8] bg-white/60" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Summary Cards */}
        <Card className="lg:col-span-4 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
          <CardHeader>
            <CardTitle className="text-sm" style={{ color: "#7F8C8D" }}>
              Total Spent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#2C3E50" }}>
              ${totalSpent.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
          <CardHeader>
            <CardTitle className="text-sm" style={{ color: "#7F8C8D" }}>
              Number of Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#2C3E50" }}>
              {numTx}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
          <CardHeader>
            <CardTitle className="text-sm" style={{ color: "#7F8C8D" }}>
              Highest Single Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#2C3E50" }}>
              ${highest.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Expense Table */}
        <Card className="lg:col-span-7 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
          <CardHeader>
            <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>
              Today's Expenses
            </CardTitle>
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
                    <div className="col-span-2" style={{ color: "#2C3E50" }}>
                      {t.description}
                    </div>
                    <div className="text-right font-semibold" style={{ color: "#2C3E50" }}>
                      ${t.amount.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        className="h-7 px-2 border-[#E8E8E8] bg-white/60 text-xs shrink-0"
                        onClick={() => console.log("Edit", t.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="h-7 px-2 border-red-300 text-red-600 bg-red-50/60 text-xs shrink-0"
                        onClick={() => console.log("Delete", t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown + Comparison */}
        <div className="lg:col-span-5 grid gap-6">
          {/* Category Breakdown */}
          <Card className="border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
            <CardHeader>
              <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>
                Category Breakdown
              </CardTitle>
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
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: cat === topCategory ? "#F4D03F" : "#2C3E50" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-xs" style={{ color: "#7F8C8D" }}>
                Top category: <span className="font-medium" style={{ color: "#2C3E50" }}>{topCategory}</span>
              </div>
            </CardContent>
          </Card>

          {/* Comparison vs Yesterday */}
          <Card className="border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
            <CardHeader>
              <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>
                Compared to Yesterday
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 items-end h-24">
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 rounded-xl bg-[#F5F3F0] border border-[#E8E8E8] overflow-hidden"
                    title={`$${yesterdaySpent.toFixed(2)}`}
                  >
                    <div
                      className="w-full rounded-xl"
                      style={{ height: "60%", background: "#2C3E50" }}
                    />
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#7F8C8D" }}>
                    Yesterday
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 rounded-xl bg-[#F5F3F0] border border-[#E8E8E8] overflow-hidden"
                    title={`$${totalSpent.toFixed(2)}`}
                  >
                    <div
                      className="w-full rounded-xl"
                      style={{ height: "85%", background: "#F4D03F" }}
                    />
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#7F8C8D" }}>
                    Today
                  </div>
                </div>
              </div>
              <div className="text-xs mt-3" style={{ color: "#7F8C8D" }}>
                Change:{" "}
                <span className="font-medium" style={{ color: "#2C3E50" }}>
                  {yesterdaySpent === 0
                    ? "+100%"
                    : `${(((totalSpent - yesterdaySpent) / Math.max(1e-6, yesterdaySpent)) * 100).toFixed(1)}%`}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Insights */}
        <Card className="lg:col-span-12 border-[#E8E8E8] bg-white/60 backdrop-blur-[9px]">
          <CardHeader>
            <CardTitle className="text-base font-semibold" style={{ color: "#2C3E50" }}>
              Daily Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-3 text-sm" style={{ color: "#2C3E50" }}>
                You spent less on Food today than usual. Keep it up by planning dinner at home.
              </div>
              <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-3 text-sm" style={{ color: "#2C3E50" }}>
                Transport looks elevated this week. Consider consolidating errands to reduce trips.
              </div>
              <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-3 text-sm" style={{ color: "#2C3E50" }}>
                Subscriptions renewals are due—review and cancel unused services to save monthly.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-3">
            <Button
              className="text-[#2C3E50]"
              style={{ background: "#F4D03F" }}
              onClick={() => navigate("/dashboard")}
            >
              Add Expense
            </Button>
            <Button variant="outline" className="border-[#E8E8E8] bg-white/60" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button variant="outline" className="border-[#E8E8E8] bg-white/60" onClick={exportPDF}>
              Export PDF
            </Button>
          </div>
          <Button
            variant="outline"
            className="border-[#E8E8E8] bg-white/60"
            onClick={() => navigate("/dashboard")}
          >
            Switch to Monthly Report
          </Button>
        </div>
      </div>
    </div>
  );
}