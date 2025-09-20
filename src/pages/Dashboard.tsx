import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Plus, Users, Receipt, TrendingUp, ArrowRight, Bell, Settings, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import JoinGroupDialog from "@/components/JoinGroupDialog";
import type { Id } from "@/convex/_generated/dataModel";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);

  // Shape of group item returned by backend (non-null)
  type GroupListItem = {
    _id: Id<"groups">;
    _creationTime: number;
    name: string;
    description?: string;
    currency?: string;
    createdBy: Id<"users">;
    inviteCode: string;
    memberCount: number;
    joinedAt: number;
  };

  const groupsRaw = useQuery(api.groups.getUserGroups);
  // Ensure non-null list of groups with correct typings
  const validGroups: GroupListItem[] = (groupsRaw ?? []).filter(
    (g): g is GroupListItem => Boolean(g)
  );

  // Add MoneyTalks computed UI placeholders (kept local — no backend changes)
  const monthlySpending = 2450;
  const remainingBudget = 1200;
  const savingsProgressPct = 68;
  const budgetRemainingPct = 47;
  const daysRemaining = (() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  })();
  const weeklyTrend: Array<number> = [12, 18, 10, 22, 16, 28, 9];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // Glass morphism + warm palette background
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #F5F3F0 0%, #FFF7E0 100%)",
      }}
    >
      {/* Header / Nav */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/30 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#2C3E50" }}
            >
              <span className="text-white text-sm font-semibold">MT</span>
            </div>
            <span className="text-lg font-bold" style={{ color: "#2C3E50" }}>
              MoneyTalks
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-sm">
            {["Dashboard", "Transactions", "Budget", "Goals", "Reports", "Settings"].map((item) => (
              <button
                key={item}
                className="px-3 py-1.5 rounded-full hover:bg-white/50 transition"
                style={{ color: "#2C3E50" }}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E8E8E8] bg-white/60 backdrop-blur-md">
              <Users className="w-4 h-4 mr-2" />
              Join
            </Button>
            <Button
              onClick={() => setShowCreateGroup(true)}
              className="text-[#2C3E50]"
              style={{ background: "#F4D03F" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <button className="p-2 rounded-full hover:bg-white/60">
              <Bell className="w-5 h-5" style={{ color: "#2C3E50" }} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/60">
              <Settings className="w-5 h-5" style={{ color: "#2C3E50" }} />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#E8E8E8] ml-1">
              <img
                src="https://i.pravatar.cc/64"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Welcome / Quick Stats (Top Left, spans 8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                Welcome back, {user.name || "Friend"}
              </h2>
              <p className="text-sm" style={{ color: "#7F8C8D" }}>
                Here's your financial snapshot for this month
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowJoinGroup(true)}
                className="border-[#E8E8E8] bg-white/70"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Group
              </Button>
              <Button
                onClick={() => setShowCreateGroup(true)}
                className="text-[#2C3E50]"
                style={{ background: "#F4D03F" }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { label: "Monthly spending", value: `$${monthlySpending.toLocaleString()}`, pct: 15 },
              { label: "Remaining budget", value: `$${remainingBudget.toLocaleString()}`, pct: 15 },
              { label: "Savings goal", value: `${savingsProgressPct}%`, pct: 60 },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#E8E8E8] bg-white/70 p-4"
                style={{ color: "#2C3E50" }}
              >
                <div className="text-sm" style={{ color: "#7F8C8D" }}>
                  {s.label}
                </div>
                <div className="text-xl font-bold mt-1">{s.value}</div>
                <div className="h-2 mt-3 rounded-full bg-[#F5F3F0] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.pct}%`,
                      background: i === 2 ? "#2C3E50" : "#F4D03F",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Budget Remaining (Top Right, spans 4 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
              Budget Remaining
            </h3>
          </div>
          <div className="flex items-center gap-6">
            <div
              className="relative w-28 h-28 rounded-full grid place-items-center"
              style={{
                background: `conic-gradient(#F4D03F ${budgetRemainingPct * 3.6}deg, #E8E8E8 0deg)`,
              }}
            >
              <div className="absolute inset-2 rounded-full bg-white/80 backdrop-blur" />
              <div className="relative text-center">
                <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                  {budgetRemainingPct}%
                </div>
                <div className="text-[11px]" style={{ color: "#7F8C8D" }}>
                  remaining
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm" style={{ color: "#7F8C8D" }}>
                Days left this month
              </div>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {daysRemaining} days
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" className="h-8 border-[#E8E8E8] bg-white/70">
                  ▷
                </Button>
                <Button variant="outline" className="h-8 border-[#E8E8E8] bg-white/70">
                  II
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile + Monthly Overview (Left column) */}
        <div className="lg:col-span-4 grid gap-6">
          {/* Profile Card */}
          <div className="rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl overflow-hidden">
            <div
              className="h-24 w-full"
              style={{ background: "linear-gradient(90deg, #FFF1B8, #FFE9A3)" }}
            />
            <div className="px-5 -mt-10 pb-5">
              <div className="w-20 h-20 rounded-2xl ring-2 ring-white overflow-hidden">
                <img src="https://i.pravatar.cc/120?img=32" alt="profile" className="w-full h-full object-cover" />
              </div>
              <div className="mt-3">
                <div className="font-semibold text-lg" style={{ color: "#2C3E50" }}>
                  {user.name || "You"}
                </div>
                <div className="text-sm" style={{ color: "#7F8C8D" }}>
                  Financial Goal: House Down Payment
                </div>
              </div>
              <div className="mt-3">
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ background: "#2C3E50", color: "#FFFFFF" }}
                >
                  Balance: ${Math.max(0, remainingBudget - 200).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions (accordion-like simple list) */}
          <div className="rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
                Recent Transactions
              </h3>
              <span className="text-xs" style={{ color: "#7F8C8D" }}>
                Last 7 days
              </span>
            </div>
            <div className="space-y-3">
              {[
                { title: "Groceries", time: "Today • 10:20", amount: -54.12 },
                { title: "Coffee", time: "Yesterday • 08:15", amount: -4.5 },
                { title: "Paycheck", time: "Fri • 09:00", amount: 2100 },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                      {t.title}
                    </div>
                    <div className="text-xs" style={{ color: "#7F8C8D" }}>
                      {t.time}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      t.amount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.amount >= 0 ? "+" : "-"}${Math.abs(t.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Overview (Center column) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
              Monthly Overview
            </h3>
            <span className="text-xs" style={{ color: "#7F8C8D" }}>
              This month's spending: ${(2100).toLocaleString()}
            </span>
          </div>

          {/* Mini bar chart (pure CSS) */}
          <div className="mt-5 grid grid-cols-7 gap-3 items-end h-32">
            {weeklyTrend.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-7 rounded-xl bg-[#F5F3F0] overflow-hidden border border-[#E8E8E8]">
                  <div
                    className="w-full rounded-xl"
                    style={{
                      height: `${Math.min(100, v * 3)}%`,
                      background: i === 5 ? "#F4D03F" : "#2C3E50",
                    }}
                  />
                </div>
                <span className="text-[10px]" style={{ color: "#7F8C8D" }}>
                  {"SMTWTFS"[i]}
                </span>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Groceries", v: 32 },
              { k: "Dining", v: 18 },
              { k: "Utilities", v: 22 },
              { k: "Transport", v: 28 },
            ].map((c) => (
              <div key={c.k} className="rounded-xl border border-[#E8E8E8] bg-white/70 p-3">
                <div className="text-xs" style={{ color: "#7F8C8D" }}>
                  {c.k}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="h-2 flex-1 rounded-full bg-[#F5F3F0] mr-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.v}%`,
                        background: c.k === "Transport" ? "#F4D03F" : "#2C3E50",
                      }}
                    />
                  </div>
                  <div className="text-xs font-medium" style={{ color: "#2C3E50" }}>
                    {c.v}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Right column) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
              Quick Actions
            </h3>
            <span className="text-xs" style={{ color: "#7F8C8D" }}>
              18%
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Log today's expenses", done: true, ts: "Today, 09:10" },
              { label: "Review weekly budget", done: true, ts: "Sun, 18:00" },
              { label: "Set up emergency fund goal", done: false, ts: "Pending" },
              { label: "Connect savings account", done: false, ts: "Pending" },
              { label: "Review investment allocations", done: false, ts: "Pending" },
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-[#E8E8E8] bg-white/70 p-3"
              >
                <div
                  className={`w-5 h-5 rounded-full grid place-items-center ${
                    t.done ? "bg-green-100" : "bg-[#F5F3F0]"
                  }`}
                >
                  {t.done ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" style={{ color: "#7F8C8D" }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                    {t.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#7F8C8D" }}>
                    {t.ts}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 border-[#E8E8E8]">
                  {t.done ? "View" : "Start"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar-ish timeline + Activity feed */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
              September 2024
            </h3>
            <div className="text-xs" style={{ color: "#7F8C8D" }}>
              Upcoming bills and due dates
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-3">
            {Array.from({ length: 14 }).map((_, i) => {
              const highlight = [2, 5, 7, 10].includes(i);
              return (
                <div
                  key={i}
                  className={`h-16 rounded-xl border border-[#E8E8E8] bg-white/70 p-2 text-xs ${
                    highlight ? "ring-2 ring-[#F4D03F]" : ""
                  }`}
                >
                  <div className="font-semibold" style={{ color: "#2C3E50" }}>
                    {i + 1}
                  </div>
                  {highlight && (
                    <div className="mt-1 text-[11px]" style={{ color: "#7F8C8D" }}>
                      Bill due
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
              Activity Feed
            </h3>
            <span className="text-xs" style={{ color: "#7F8C8D" }}>
              Recent
            </span>
          </div>
          <div className="space-y-3">
            {[
              { t: "Weekly Budget Review", time: "Sep 15, 08:30" },
              { t: "Savings Goal Update", time: "Sep 15, 10:30" },
              { t: "Transaction Sync", time: "Sep 15, 15:00" },
              { t: "Budget Alert", time: "Sep 14, 14:45" },
              { t: "Goal Achievement", time: "Sep 13, 16:30" },
            ].map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-[#E8E8E8] bg-white/70 p-3"
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                    {a.t}
                  </div>
                  <div className="text-xs" style={{ color: "#7F8C8D" }}>
                    {a.time}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" style={{ color: "#7F8C8D" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Your Groups section (kept from original, styled) */}
        <div className="lg:col-span-12">
          <h3 className="text-lg font-bold mb-4" style={{ color: "#2C3E50" }}>
            Your Groups
          </h3>
          {validGroups.length === 0 ? (
            <div className="rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-white/80 grid place-items-center mx-auto mb-4">
                <Receipt className="w-7 h-7" style={{ color: "#7F8C8D" }} />
              </div>
              <div className="font-semibold" style={{ color: "#2C3E50" }}>
                No groups yet
              </div>
              <p className="text-sm mt-1" style={{ color: "#7F8C8D" }}>
                Join or create your first group to start tracking shared expenses.
              </p>
              <div className="flex gap-3 justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowJoinGroup(true)}
                  className="border-[#E8E8E8] bg-white/70"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Existing Group
                </Button>
                <Button
                  onClick={() => setShowCreateGroup(true)}
                  className="text-[#2C3E50]"
                  style={{ background: "#F4D03F" }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Group
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {validGroups.map((group, index) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Card
                    className="cursor-pointer transition-all duration-200 border-[#E8E8E8] bg-white/70 backdrop-blur-xl hover:bg-white"
                    onClick={() => navigate(`/group/${group._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold" style={{ color: "#2C3E50" }}>
                          {group.name}
                        </CardTitle>
                        <ArrowRight className="w-4 h-4" style={{ color: "#7F8C8D" }} />
                      </div>
                      {group.description && (
                        <p className="text-sm mt-1" style={{ color: "#7F8C8D" }}>
                          {group.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center" style={{ color: "#7F8C8D" }}>
                          <Users className="w-4 h-4 mr-1" />
                          {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                        </div>
                        <div className="" style={{ color: "#7F8C8D" }}>
                          {group.currency || "USD"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateGroupDialog open={showCreateGroup} onOpenChange={setShowCreateGroup} />
      <JoinGroupDialog open={showJoinGroup} onOpenChange={setShowJoinGroup} />
    </motion.div>
  );
}