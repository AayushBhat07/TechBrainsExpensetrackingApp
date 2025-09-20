import React, { useEffect, useState } from "react";
import { Repeat, Calendar, AlertCircle, Clock, Edit3, Trash2, Plus, Pause, Play } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface RecurringPayment {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  nextDue: string;
  lastPaid: string;
  status: "active" | "paused" | "cancelled";
  autoPayEnabled: boolean;
  merchant: string;
  accountLinked: string;
  totalPaidThisYear: number;
  daysUntilDue: number;
}

export const RecurringPaymentsSection: React.FC = () => {
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([
    {
      id: "1",
      name: "Netflix Subscription",
      category: "Entertainment",
      amount: 15.99,
      frequency: "monthly",
      nextDue: "2025-10-15",
      lastPaid: "2025-09-15",
      status: "active",
      autoPayEnabled: true,
      merchant: "Netflix",
      accountLinked: "Main Checking",
      totalPaidThisYear: 159.9,
      daysUntilDue: 3,
    },
    {
      id: "2",
      name: "Electric Bill",
      category: "Bills & Utilities",
      amount: 145.2,
      frequency: "monthly",
      nextDue: "2025-10-20",
      lastPaid: "2025-09-20",
      status: "active",
      autoPayEnabled: false,
      merchant: "City Electric",
      accountLinked: "Main Checking",
      totalPaidThisYear: 1452.0,
      daysUntilDue: 8,
    },
    {
      id: "3",
      name: "Gym Membership",
      category: "Healthcare",
      amount: 45.0,
      frequency: "monthly",
      nextDue: "2025-10-12",
      lastPaid: "2025-09-12",
      status: "active",
      autoPayEnabled: true,
      merchant: "FitLife Gym",
      accountLinked: "Main Checking",
      totalPaidThisYear: 450.0,
      daysUntilDue: 0,
    },
    {
      id: "4",
      name: "Adobe Creative Cloud",
      category: "Software",
      amount: 52.99,
      frequency: "monthly",
      nextDue: "2025-10-25",
      lastPaid: "2025-09-25",
      status: "paused",
      autoPayEnabled: false,
      merchant: "Adobe",
      accountLinked: "Credit Card",
      totalPaidThisYear: 476.91,
      daysUntilDue: 13,
    },
  ]);

  // Backend data
  const serverRecurring = useQuery(api.recurring.list) as any[] | undefined;
  const addRecurring = useMutation(api.recurring.add);
  const toggleRecurring = useMutation(api.recurring.toggleStatus);
  const removeRecurring = useMutation(api.recurring.remove);

  // Merge: keep mock + server (server items appended, avoid duplicates by name+amount)
  const mergedPayments = (() => {
    const base = [...recurringPayments];
    for (const r of serverRecurring ?? []) {
      const exists = base.find(
        (p) => p.name === r.name && Math.abs(p.amount - r.amount) < 0.001,
      );
      const daysUntil = Math.max(0, Math.ceil((r.nextDue - Date.now()) / (1000 * 60 * 60 * 24)));
      if (!exists) {
        base.push({
          id: String(r._id),
          name: r.name,
          category: r.category,
          amount: r.amount,
          frequency: r.frequency,
          nextDue: new Date(r.nextDue).toISOString().slice(0, 10),
          lastPaid: r.lastPaid ? new Date(r.lastPaid).toISOString().slice(0, 10) : "",
          status: r.status,
          autoPayEnabled: !!r.autoPayEnabled,
          merchant: r.merchant ?? "",
          accountLinked: r.accountLinked ?? "",
          totalPaidThisYear: r.totalPaidThisYear ?? 0,
          daysUntilDue: daysUntil,
        });
      }
    }
    return base;
  })();

  // Add dialog state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly" | "quarterly" | "annually">("monthly");
  const [nextDue, setNextDue] = useState<string>("");
  const [category, setCategory] = useState<string>("Subscriptions");
  const [merchant, setMerchant] = useState<string>("");
  const [accountLinked, setAccountLinked] = useState<string>("");
  const [autoPay, setAutoPay] = useState<boolean>(true);

  useEffect(() => {
    const handler = (_e: Event) => setOpen(true);
    window.addEventListener("open-recurring-modal", handler as EventListener);
    return () => window.removeEventListener("open-recurring-modal", handler as EventListener);
  }, []);

  const submitAdd = async () => {
    try {
      if (!name || !amount || !nextDue) {
        toast("Fill name, amount, and next due date.");
        return;
      }
      await addRecurring({
        name,
        category,
        amount: Number(amount),
        frequency,
        nextDue: new Date(nextDue).getTime(),
        autoPayEnabled: autoPay,
        merchant: merchant || undefined,
        accountLinked: accountLinked || undefined,
      });
      toast("Recurring payment added.");
      setOpen(false);
      setName(""); setAmount(0); setNextDue(""); setMerchant(""); setAccountLinked("");
    } catch (e: any) {
      toast(e.message || "Failed to add recurring payment");
    }
  };

  const totalMonthlyRecurring = mergedPayments
    .filter((p) => p.status === "active")
    .reduce((sum, p) => {
      const multiplier =
        {
          weekly: 4.33,
          biweekly: 2.17,
          monthly: 1,
          quarterly: 0.33,
          annually: 0.083,
        }[p.frequency] || 1;
      return sum + p.amount * multiplier;
    }, 0);

  const upcomingPayments = mergedPayments
    .filter((p) => p.daysUntilDue <= 7 && p.status === "active")
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-600 bg-emerald-500/20 border-emerald-500/40";
      case "paused":
        return "text-yellow-600 bg-yellow-500/20 border-yellow-500/40";
      case "cancelled":
        return "text-red-500 bg-red-500/20 border-red-500/40";
      default:
        return "text-foreground/60 bg-white/10 border-white/20";
    }
  };

  const getDueDateStatus = (daysUntilDue: number) => {
    if (daysUntilDue === 0) return { text: "Due Today", color: "text-red-500", icon: AlertCircle };
    if (daysUntilDue <= 3) return { text: `Due in ${daysUntilDue} days`, color: "text-yellow-600", icon: Clock };
    return { text: `Due in ${daysUntilDue} days`, color: "text-foreground/60", icon: Calendar };
  };

  return (
    <div className="space-y-6">
      <GlassCard size="responsive" variant="data">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center">
              <Repeat className="w-6 h-6 mr-3" />
              Recurring Payments
            </h2>
            <p className="text-muted-foreground">Manage your subscriptions and automatic payments</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/40 rounded-lg">
              <div className="text-xl text-blue-600 font-semibold">${totalMonthlyRecurring.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Monthly Total</div>
            </div>
            <div className="text-center p-3 bg-white/40 rounded-lg">
              <div className="text-xl text-emerald-600 font-semibold">
                {mergedPayments.filter((p) => p.status === "active").length}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center p-3 bg-white/40 rounded-lg">
              <div className="text-xl text-yellow-600 font-semibold">{upcomingPayments.length}</div>
              <div className="text-xs text-muted-foreground">Due Soon</div>
            </div>
            <div className="text-center p-3 bg-white/40 rounded-lg">
              <div className="text-xl text-purple-600 font-semibold">
                {mergedPayments.filter((p) => p.autoPayEnabled).length}
              </div>
              <div className="text-xs text-muted-foreground">Auto-Pay</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="inline-flex items-center px-3 py-2 rounded-lg border border-blue-500/40 bg-blue-500/20 hover:bg-blue-500/30 transition" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Recurring Payment
          </button>
        </div>
      </GlassCard>

      {upcomingPayments.length > 0 && (
        <GlassCard size="responsive" variant="warning">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold">Upcoming Payments</h3>
                <p className="text-muted-foreground">
                  {upcomingPayments.length} payment(s) due in the next 7 days
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              {upcomingPayments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="text-right">
                  <div className="text-sm font-semibold">{payment.name}</div>
                  <div className="text-xs text-yellow-600">
                    {payment.daysUntilDue === 0 ? "Today" : `${payment.daysUntilDue}d`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      <div className="space-y-4">
        {mergedPayments.map((payment) => {
          const dueDateStatus = getDueDateStatus(payment.daysUntilDue);
          const DueDateIcon = dueDateStatus.icon as any;

          return (
            <GlassCard key={payment.id} size="responsive" className="hover:bg-white/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      payment.status === "active" ? "bg-emerald-500" : payment.status === "paused" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold">{payment.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      {payment.autoPayEnabled && (
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-600 rounded-full border border-blue-500/40">
                          Auto-Pay
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount</span>
                        <div className="font-semibold">${payment.amount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frequency</span>
                        <div className="capitalize">{payment.frequency}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Due</span>
                        <div className={`flex items-center space-x-1 ${dueDateStatus.color}`}>
                          <DueDateIcon className="w-3 h-3" />
                          <span>{dueDateStatus.text}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Account</span>
                        <div>{payment.accountLinked}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={async () => {
                      if (serverRecurring?.some((r) => String(r._id) === payment.id)) {
                        try {
                          await toggleRecurring({ id: payment.id as any });
                        } catch (e: any) {
                          toast(e.message || "Failed to update");
                        }
                        return;
                      }
                      const updated = mergedPayments.map((p) =>
                        p.id === payment.id ? { ...p, status: p.status === "active" ? ("paused" as const) : ("active" as const) } : p,
                      );
                      setRecurringPayments(updated);
                    }}
                    className={`px-3 py-2 rounded-lg border ${
                      payment.status === "active" ? "text-yellow-600 border-yellow-500/40" : "text-emerald-600 border-emerald-500/40"
                    }`}
                  >
                    {payment.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="px-3 py-2 rounded-lg border bg-black/10">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg border text-red-500 border-red-500/40"
                    onClick={async () => {
                      if (serverRecurring?.some((r) => String(r._id) === payment.id)) {
                        try {
                          await removeRecurring({ id: payment.id as any });
                          toast("Removed");
                        } catch (e: any) {
                          toast(e.message || "Failed to remove");
                        }
                        return;
                      }
                      setRecurringPayments((prev) => prev.filter((p) => p.id !== payment.id));
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Merchant</span>
                    <div>{payment.merchant}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <div>{payment.category}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Paid This Year</span>
                    <div className="font-semibold">${payment.totalPaidThisYear.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add Recurring Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-[9px]">
          <DialogHeader>
            <DialogTitle>Add Recurring Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Name</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix Subscription" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Amount</div>
                <Input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Next Due</div>
                <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Frequency</div>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {["weekly","biweekly","monthly","quarterly","annually"].map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Category</div>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Subscriptions" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Merchant</div>
                <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Netflix" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Account</div>
                <Input value={accountLinked} onChange={(e) => setAccountLinked(e.target.value)} placeholder="Main Checking" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={autoPay} onChange={(e) => setAutoPay(e.target.checked)} />
                  Auto-Pay Enabled
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button className="px-3 py-2 rounded-lg border bg-black/10" onClick={() => setOpen(false)}>Cancel</button>
            <button className="px-3 py-2 rounded-lg border border-blue-500/40 bg-blue-500/20" onClick={submitAdd}>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};