import React, { useState } from "react";
import { PieChart as PieIcon, BarChart as BarIcon, Calendar as CalendarIcon, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart as BarChartComponent } from "@/components/charts/BarChart";
import { HeatmapCalendar } from "@/components/charts/HeatmapCalendar";

interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  trend: number;
  transactions: number;
  budget: number;
}

export const SpendingAnalyticsSection: React.FC = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [viewType, setViewType] = useState<"category" | "daily" | "heatmap">("category");

  const categoryData: SpendingCategory[] = [
    { name: "Food & Dining", amount: 680, percentage: 29.1, color: "#f97316", trend: 12.5, transactions: 42, budget: 600 },
    { name: "Transportation", amount: 420, percentage: 17.9, color: "#3b82f6", trend: -5.2, transactions: 18, budget: 500 },
    { name: "Shopping", amount: 350, percentage: 15.0, color: "#8b5cf6", trend: 8.7, transactions: 23, budget: 400 },
    { name: "Entertainment", amount: 280, percentage: 12.0, color: "#ec4899", trend: -3.1, transactions: 15, budget: 300 },
    { name: "Bills & Utilities", amount: 260, percentage: 11.1, color: "#ef4444", trend: 0.8, transactions: 8, budget: 280 },
    { name: "Healthcare", amount: 180, percentage: 7.7, color: "#06b6d4", trend: 15.3, transactions: 6, budget: 200 },
    { name: "Other", amount: 170, percentage: 7.3, color: "#64748b", trend: -2.4, transactions: 12, budget: 150 },
  ];

  const dailySpending = [
    { day: "Mon", amount: 85, transactions: 4 },
    { day: "Tue", amount: 120, transactions: 6 },
    { day: "Wed", amount: 95, transactions: 5 },
    { day: "Thu", amount: 150, transactions: 8 },
    { day: "Fri", amount: 200, transactions: 12 },
    { day: "Sat", amount: 180, transactions: 9 },
    { day: "Sun", amount: 110, transactions: 7 },
  ];

  const heatmapData = Array.from({ length: 28 }, (_, i) => ({
    date: `2025-10-${String(i + 1).padStart(2, "0")}`,
    value: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="space-y-6">
      <GlassCard size="responsive">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Spending Analytics</h2>
            <p className="text-muted-foreground">Visualize your spending patterns and trends</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 rounded-lg border border-white/20 bg-black/10"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            <div className="flex space-x-1 bg-black/10 p-1 rounded-lg">
              {[
                { value: "category", icon: PieIcon, label: "Categories" },
                { value: "daily", icon: BarIcon, label: "Daily" },
                { value: "heatmap", icon: CalendarIcon, label: "Calendar" },
              ].map((view) => {
                const Icon = view.icon;
                const active = viewType === (view.value as any);
                return (
                  <button
                    key={view.value}
                    onClick={() => setViewType(view.value as any)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${
                      active ? "bg-white text-black" : "text-foreground/70 hover:text-foreground hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{view.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard size="responsive" className="h-full">
            {viewType === "category" && (
              <div className="space-y-6">
                <h3 className="font-semibold text-xl">Spending by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="relative">
                    <DonutChart
                      data={categoryData.map((cat) => ({
                        name: cat.name,
                        value: cat.amount,
                        color: cat.color,
                      }))}
                      size={280}
                      innerRadius={90}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <div className="text-3xl font-semibold">
                        ${categoryData.reduce((s, c) => s + c.amount, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {categoryData.map((category) => (
                      <div
                        key={category.name}
                        className="flex items-center justify-between p-3 bg-white/40 rounded-lg hover:bg-white/60 transition"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <div>
                            <div className="text-sm font-medium">{category.name}</div>
                            <div className="text-xs text-muted-foreground">{category.transactions} transactions</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${category.amount}</div>
                          <div
                            className={`text-xs flex items-center ${
                              category.trend >= 0 ? "text-red-500" : "text-emerald-600"
                            }`}
                          >
                            <TrendingDown className={`w-3 h-3 mr-1 ${category.trend >= 0 ? "rotate-180" : ""}`} />
                            {Math.abs(category.trend)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewType === "daily" && (
              <div className="space-y-6">
                <h3 className="font-semibold text-xl">Daily Spending Pattern</h3>
                <BarChartComponent data={dailySpending as any} xKey="day" yKey="amount" color="#3b82f6" height={300} />
                <div className="grid grid-cols-7 gap-2 text-center">
                  {dailySpending.map((day) => (
                    <div key={day.day} className="p-2 bg-white/40 rounded-lg">
                      <div className="text-xs text-muted-foreground">{day.day}</div>
                      <div className="text-sm font-semibold">${day.amount}</div>
                      <div className="text-xs text-muted-foreground">{day.transactions} txns</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewType === "heatmap" && (
              <div className="space-y-6">
                <h3 className="font-semibold text-xl">Spending Calendar Heatmap</h3>
                <HeatmapCalendar data={heatmapData} colorScale={["#e5e7eb", "#93c5fd", "#60a5fa", "#3b82f6"]} />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Less</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: ["#e5e7eb", "#93c5fd", "#60a5fa", "#3b82f6"][i - 1] }} />
                    ))}
                  </div>
                  <span className="text-muted-foreground">More</span>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <div>
          <GlassCard size="responsive" className="h-full">
            <div className="space-y-6">
              <h3 className="font-semibold text-xl">Budget vs Actual</h3>
              <div className="space-y-4">
                {categoryData.slice(0, 6).map((category) => {
                  const percentage = (category.amount / category.budget) * 100;
                  const isOverBudget = percentage > 100;
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className={`text-sm font-semibold ${isOverBudget ? "text-red-500" : "text-emerald-600"}`}>
                          ${category.amount} / ${category.budget}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-white/40 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isOverBudget ? "bg-red-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        {isOverBudget && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{percentage.toFixed(1)}% used</span>
                        {isOverBudget && (
                          <span className="text-red-500 font-semibold">${(category.amount - category.budget).toFixed(0)} over</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard size="responsive" variant="data">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl">
            <h4 className="text-sm text-muted-foreground mb-2">Highest Category</h4>
            <div className="text-xl text-orange-500 font-semibold">Food & Dining</div>
            <div className="text-sm text-muted-foreground">$680 • 29.1% of total</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl">
            <h4 className="text-sm text-muted-foreground mb-2">Best Savings</h4>
            <div className="text-xl text-emerald-600 font-semibold">Transportation</div>
            <div className="text-sm text-muted-foreground">-5.2% vs last month</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl">
            <h4 className="text-sm text-muted-foreground mb-2">Alert Category</h4>
            <div className="text-xl text-yellow-600 font-semibold">Food & Dining</div>
            <div className="text-sm text-muted-foreground">13% over budget</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};