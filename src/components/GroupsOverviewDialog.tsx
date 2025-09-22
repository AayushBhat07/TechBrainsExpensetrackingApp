import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Wallet, BarChart3, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

type GroupsOverviewDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

type MockGroup = {
  id: string;
  name: string;
  description: string;
  members: number;
  monthlySpend: number;
  currency: string;
  inviteCode: string;
};

const mockGroups: Array<MockGroup> = [
  { id: "g1", name: "Roommates 42nd", description: "Rent, utilities, internet", members: 4, monthlySpend: 2310, currency: "USD", inviteCode: "RM42LIVE" },
  { id: "g2", name: "Weekend Trip", description: "Cabins, gas, groceries", members: 6, monthlySpend: 1284, currency: "USD", inviteCode: "TRIPWKND" },
  { id: "g3", name: "Family Expenses", description: "Groceries & essentials", members: 3, monthlySpend: 960, currency: "USD", inviteCode: "FAM2025" },
];

function format(n: number) {
  return n.toLocaleString();
}

export default function GroupsOverviewDialog({ open, onOpenChange }: GroupsOverviewDialogProps) {
  const totals = React.useMemo(() => {
    const totalGroups = mockGroups.length;
    const totalMembers = mockGroups.reduce((a, g) => a + g.members, 0);
    const totalSpend = mockGroups.reduce((a, g) => a + g.monthlySpend, 0);
    const dist = mockGroups.map((g) => ({
      name: g.name,
      value: g.monthlySpend,
    }));
    return { totalGroups, totalMembers, totalSpend, dist };
  }, []);

  const top = Math.max(...mockGroups.map((g) => g.monthlySpend));

  // Simple color palette
  const colors = ["#2C3E50", "#F4D03F", "#7F8C8D", "#16A085", "#8E44AD"];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast(`Invite code copied: ${code}`));
  };

  const handleOpen = (group: MockGroup) => {
    toast(`Opening ${group.name}… (group page coming soon)`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/80 backdrop-blur-[9px] max-w-3xl">
        <DialogHeader>
          <DialogTitle>Groups Overview</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Groups</div>
              <Users className="w-4 h-4 text-[#2C3E50]" />
            </div>
            <div className="text-2xl font-bold mt-2 text-[#2C3E50]">{totals.totalGroups}</div>
          </div>
          <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Members</div>
              <Users className="w-4 h-4 text-[#2C3E50]" />
            </div>
            <div className="text-2xl font-bold mt-2 text-[#2C3E50]">{totals.totalMembers}</div>
          </div>
          <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Monthly Spend</div>
              <Wallet className="w-4 h-4 text-[#2C3E50]" />
            </div>
            <div className="text-2xl font-bold mt-2 text-[#2C3E50]">${format(totals.totalSpend)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Donut */}
          <div className="md:col-span-2 rounded-xl border border-[#E8E8E8] bg-white/70 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-[#2C3E50]">Spending Split</div>
              <BarChart3 className="w-4 h-4 text-[#2C3E50]" />
            </div>

            {/* SVG Donut */}
            {(() => {
              const total = totals.dist.reduce((a, d) => a + d.value, 0) || 1;
              // Increase internal canvas size but render responsively
              const size = 240;
              const radius = 90;
              const stroke = 22;
              const center = size / 2;
              const circumference = 2 * Math.PI * radius;

              let cumulative = 0;
              const segments = totals.dist.map((d, i) => {
                const frac = d.value / total;
                const length = frac * circumference;
                const offset = circumference - cumulative;
                cumulative += length;
                return {
                  color: colors[i % colors.length],
                  length,
                  offset,
                };
              });

              return (
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-full max-w-[280px] aspect-square">
                    <svg
                      viewBox={`0 0 ${size} ${size}`}
                      width="100%"
                      height="100%"
                      className="block"
                    >
                      {/* Background ring */}
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#F5F3F0"
                        strokeWidth={stroke}
                      />
                      {/* Segments */}
                      <g transform={`rotate(-90 ${center} ${center})`}>
                        {segments.map((s, i) => (
                          <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${s.length} ${circumference}`}
                            strokeDashoffset={s.offset}
                            strokeLinecap="butt"
                          />
                        ))}
                      </g>
                    </svg>

                    {/* Center label */}
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-xl font-semibold text-[#2C3E50]">
                        ${format(totals.totalSpend)}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-3 min-w-[180px] w-full">
                    {totals.dist.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 rounded-sm"
                            style={{ background: colors[i % colors.length] }}
                          />
                          <span className="text-sm text-[#2C3E50]">{d.name}</span>
                        </div>
                        <span className="text-sm text-[#2C3E50]">
                          ${format(d.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bars */}
          <div className="md:col-span-3 rounded-xl border border-[#E8E8E8] bg-white/70 p-4">
            <div className="font-semibold text-[#2C3E50] mb-3">Monthly Spend by Group</div>
            <div className="grid grid-cols-6 items-end gap-3 h-40">
              {mockGroups.map((g, i) => {
                const pct = Math.max(8, Math.round((g.monthlySpend / top) * 100));
                return (
                  <div key={g.id} className="flex flex-col items-center gap-2">
                    <div className="w-full min-w-4 rounded-lg bg-[#F5F3F0] border border-[#E8E8E8] overflow-hidden" style={{ height: "100%" }}>
                      <div
                        className="w-full rounded-lg"
                        style={{
                          height: `${pct}%`,
                          marginTop: `${100 - pct}%`,
                          background: colors[i % colors.length],
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {g.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Groups list */}
        <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-[#2C3E50]">Your Groups</div>
            <div className="text-xs text-muted-foreground">Mock data</div>
          </div>
          <div className="space-y-3">
            {mockGroups.map((g, i) => (
              <div key={g.id} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-lg border border-[#E8E8E8] bg-white/60 p-3">
                <div className="min-w-0">
                  <div className="font-medium text-[#2C3E50] truncate">{g.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{g.description}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-[#2C3E50]">
                    <span className="text-xs text-muted-foreground mr-1">Members</span>
                    <span className="font-semibold">{g.members}</span>
                  </div>
                  <div className="text-sm text-[#2C3E50]">
                    <span className="text-xs text-muted-foreground mr-1">Monthly</span>
                    <span className="font-semibold">
                      ${format(g.monthlySpend)} {g.currency}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-8" onClick={() => handleCopy(g.inviteCode)}>
                    <Copy className="w-4 h-4 mr-1" /> Invite
                  </Button>
                  <Button className="h-8" style={{ background: "#F4D03F", color: "#2C3E50" }} onClick={() => handleOpen(g)}>
                    Open <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}