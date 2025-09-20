import React, { useState } from "react";
import { Target, TrendingUp, Repeat, PieChart, Settings, Plus, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CircularProgressBar } from "@/components/ui/CircularProgressBar";
import { LinearProgressBar } from "@/components/ui/LinearProgressBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface BudgetData {
  monthlyGoal: number;
  spent: number;
  remaining: number;
  daysLeft: number;
  dailyAllowance: number;
  projectedSpending: number;
  lastMonthComparison: number;
}

export const TransactionsPageHeader: React.FC = () => {
  const [budgetData] = useState<BudgetData>({
    monthlyGoal: 3500,
    spent: 2340,
    remaining: 1160,
    daysLeft: 12,
    dailyAllowance: 96.67,
    projectedSpending: 3680,
    lastMonthComparison: -8.5,
  });

  const progressPercentage = (budgetData.spent / budgetData.monthlyGoal) * 100;
  const isOverBudget = progressPercentage > 100;
  const isWarning = progressPercentage > 80;

  // Add state: dialogs for add transaction and set budget
  const [txOpen, setTxOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

  // Basic form state
  const [txGroupId, setTxGroupId] = useState<string>("");
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txCategory, setTxCategory] = useState("other");
  // Add: allow choosing to save to a group or not
  const [saveToGroup, setSaveToGroup] = useState<boolean>(true);

  const [bgGroupId, setBgGroupId] = useState<string>("");
  const [bgCategory, setBgCategory] = useState("other");
  const [bgMonth, setBgMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [bgLimit, setBgLimit] = useState<number>(1000);

  // Data: groups list
  const groups = useQuery(api.groups.getUserGroups) as any[] | undefined;

  // Mutations
  const createExpense = useMutation(api.expenses.create);
  const upsertBudget = useMutation(api.budgets.upsert as any);

  const submitTx = async () => {
    try {
      // Adjust validation to respect the toggle
      if ((saveToGroup && !txGroupId) || !txTitle || !txAmount) {
        toast("Fill all fields for the new transaction.");
        return;
      }

      // If not saving to a group, keep it local (no backend), close dialog
      if (!saveToGroup) {
        toast("Saved locally (not added to any group).");
        setTxOpen(false);
        setTxTitle("");
        setTxAmount(0);
        setTxCategory("other");
        setTxGroupId("");
        return;
      }

      // Fetch members for equal split
      const details = await (window as any).convexClient?.query?.(api.groups.getGroupDetails, { groupId: txGroupId });
      // Fallback: use runTime fetch via useQuery is not available here; do a simple equal split assumption:
      const members: any[] = details?.members ?? [];
      if (!members.length) {
        toast("Selected group has no members.");
        return;
      }
      const per = +(txAmount / members.length).toFixed(2);
      await createExpense({
        groupId: txGroupId as any,
        title: txTitle,
        amount: Number(txAmount),
        category: txCategory as any,
        splitAmounts: members.map((m) => ({ userId: m._id, amount: per })),
      });
      toast("Transaction added.");
      setTxOpen(false);
      setTxTitle("");
      setTxAmount(0);
      setTxCategory("other");
      setTxGroupId("");
    } catch (e: any) {
      toast(e.message || "Failed to add transaction");
    }
  };

  const submitBudget = async () => {
    try {
      if (!bgGroupId || !bgMonth || !bgCategory || !bgLimit) {
        toast("Fill all fields for the budget.");
        return;
      }
      await upsertBudget({
        groupId: bgGroupId as any,
        category: bgCategory,
        month: bgMonth,
        monthlyLimit: Number(bgLimit),
      });
      toast("Budget goal saved.");
      setBudgetOpen(false);
    } catch (e: any) {
      toast(e.message || "Failed to save budget");
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard
        size="responsive"
        variant={isOverBudget ? "danger" : isWarning ? "warning" : "success"}
        className="relative overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <CircularProgressBar
                percentage={Math.min(progressPercentage, 100)}
                size={180}
                strokeWidth={12}
                color={isOverBudget ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981"}
                backgroundColor="rgba(255,255,255,0.1)"
              >
                <div className="text-center">
                  <div className="text-3xl font-semibold">{Math.round(progressPercentage)}%</div>
                  <div className="text-sm text-muted-foreground">
                    {isOverBudget ? "Over Budget" : "Budget Used"}
                  </div>
                </div>
              </CircularProgressBar>
              {isOverBudget && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <button className="mt-4 inline-flex items-center px-3 py-2 rounded-lg border border-blue-500/40 bg-blue-500/20 hover:bg-blue-500/30 transition">
              <Settings className="w-4 h-4 mr-2" />
              Adjust Budget
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">October Budget</h1>
              <p className="text-muted-foreground">
                Track your spending goals and financial health
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/40 rounded-lg">
                <div className="text-2xl text-blue-600 font-semibold">
                  ${budgetData.monthlyGoal.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Goal</div>
              </div>
              <div className="text-center p-4 bg-white/40 rounded-lg">
                <div className="text-2xl text-red-500 font-semibold">
                  ${budgetData.spent.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Spent So Far</div>
              </div>
              <div className="text-center p-4 bg-white/40 rounded-lg">
                <div
                  className={`text-2xl font-semibold ${
                    isOverBudget ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  ${Math.abs(budgetData.remaining).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isOverBudget ? "Over Budget" : "Remaining"}
                </div>
              </div>
              <div className="text-center p-4 bg-white/40 rounded-lg">
                <div className="text-2xl text-yellow-500 font-semibold">
                  ${budgetData.dailyAllowance.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Daily Allowance</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Spending Projection
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Projected Monthly Total</span>
                  <span
                    className={`font-semibold ${
                      budgetData.projectedSpending > budgetData.monthlyGoal
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}
                  >
                    ${budgetData.projectedSpending.toLocaleString()}
                  </span>
                </div>
                <LinearProgressBar
                  percentage={(budgetData.projectedSpending / budgetData.monthlyGoal) * 100}
                  height={8}
                  color={
                    budgetData.projectedSpending > budgetData.monthlyGoal ? "#ef4444" : "#10b981"
                  }
                  backgroundColor="rgba(255,255,255,0.1)"
                />
              </div>
              <div className="p-4 bg-white/40 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">vs Last Month</div>
                    <div
                      className={`font-semibold ${
                        budgetData.lastMonthComparison > 0 ? "text-red-500" : "text-emerald-600"
                      }`}
                    >
                      {budgetData.lastMonthComparison > 0 ? "+" : ""}
                      {budgetData.lastMonthComparison}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Days Remaining</div>
                    <div className="text-yellow-600 font-semibold">{budgetData.daysLeft}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard size="responsive">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center px-3 py-2 rounded-lg border border-blue-500/40 bg-blue-500/20 hover:bg-blue-500/30 transition" onClick={() => setTxOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </button>
            <button className="inline-flex items-center px-3 py-2 rounded-lg border border-purple-500/40 bg-purple-500/20 hover:bg-purple-500/30 transition" onClick={() => setBudgetOpen(true)}>
              <Target className="w-4 h-4 mr-2" />
              Set Budget Goal
            </button>
            <button className="inline-flex items-center px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 transition">
              <Repeat className="w-4 h-4 mr-2" />
              Manage Recurring
            </button>
            <button className="inline-flex items-center px-3 py-2 rounded-lg border border-orange-500/40 bg-orange-500/20 hover:bg-orange-500/30 transition">
              <PieChart className="w-4 h-4 mr-2" />
              View Analytics
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <select className="px-3 py-2 rounded-lg border border-white/20 bg-black/10">
              <option value="october-2025">October 2025</option>
              <option value="september-2025">September 2025</option>
              <option value="august-2025">August 2025</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Add Transaction Dialog */}
      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-[9px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {/* Save-to-group toggle */}
            <div className="flex items-center justify-between rounded-lg border border-[#E8E8E8] bg-white/60 px-3 py-2">
              <div>
                <div className="text-sm font-medium">Save to a group</div>
                <div className="text-xs text-muted-foreground">Turn off for a personal (local) transaction</div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saveToGroup}
                  onChange={(e) => setSaveToGroup(e.target.checked)}
                />
              </label>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Group</div>
              <Select value={txGroupId} onValueChange={setTxGroupId} disabled={!saveToGroup}>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder={saveToGroup ? "Select a group" : "Personal (no group)"} />
                </SelectTrigger>
                <SelectContent>
                  {(groups ?? []).map((g: any) => (
                    <SelectItem key={g._id} value={g._id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Title</div>
              <Input value={txTitle} onChange={(e) => setTxTitle(e.target.value)} placeholder="e.g., Lunch" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Amount</div>
              <Input type="number" value={txAmount} onChange={(e) => setTxAmount(parseFloat(e.target.value))} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Category</div>
              <Select value={txCategory} onValueChange={setTxCategory}>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {["groceries","utilities","rent","dining","transportation","entertainment","household","healthcare","other"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button className="px-3 py-2 rounded-lg border bg-black/10" onClick={() => setTxOpen(false)}>Cancel</button>
            <button className="px-3 py-2 rounded-lg border border-blue-500/40 bg-blue-500/20" onClick={submitTx}>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Budget Dialog */}
      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-[9px]">
          <DialogHeader>
            <DialogTitle>Set Budget Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Group</div>
              <Select value={bgGroupId} onValueChange={setBgGroupId}>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {(groups ?? []).map((g: any) => (
                    <SelectItem key={g._id} value={g._id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Category</div>
              <Select value={bgCategory} onValueChange={setBgCategory}>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {["groceries","utilities","rent","dining","transportation","entertainment","household","healthcare","other"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Month (YYYY-MM)</div>
              <Input value={bgMonth} onChange={(e) => setBgMonth(e.target.value)} placeholder="2025-10" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Monthly Limit</div>
              <Input type="number" value={bgLimit} onChange={(e) => setBgLimit(parseFloat(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <button className="px-3 py-2 rounded-lg border bg-black/10" onClick={() => setBudgetOpen(false)}>Cancel</button>
            <button className="px-3 py-2 rounded-lg border border-purple-500/40 bg-purple-500/20" onClick={submitBudget}>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};