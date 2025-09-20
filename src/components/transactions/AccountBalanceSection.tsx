import React, { useState } from "react";
import { Wallet, CreditCard, PiggyBank, TrendingUp, Eye, EyeOff, Plus, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  currency: string;
  lastSync: string;
  trend: number;
  icon: string;
}

export const AccountBalanceSection: React.FC = () => {
  const [showBalances, setShowBalances] = useState(true);
  const [accounts] = useState<Account[]>([
    { id: "1", name: "Main Checking", type: "checking", balance: 4250.8, currency: "USD", lastSync: "2 mins ago", trend: 12.5, icon: "🏦" },
    { id: "2", name: "Emergency Savings", type: "savings", balance: 12750.0, currency: "USD", lastSync: "5 mins ago", trend: 3.2, icon: "🐷" },
    { id: "3", name: "Credit Card", type: "credit", balance: -1840.25, currency: "USD", lastSync: "1 min ago", trend: -5.8, icon: "💳" },
    { id: "4", name: "Investment Portfolio", type: "investment", balance: 8950.4, currency: "USD", lastSync: "10 mins ago", trend: 8.7, icon: "📈" },
  ]);

  const totalNetWorth = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalAssets = accounts.filter((acc) => acc.balance > 0).reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = Math.abs(accounts.filter((acc) => acc.balance < 0).reduce((sum, acc) => sum + acc.balance, 0));

  const getAccountIcon = (type: string) => {
    const icons = { checking: Wallet, savings: PiggyBank, credit: CreditCard, investment: TrendingUp };
    return (icons as any)[type] || Wallet;
  };

  return (
    <div className="space-y-6">
      <GlassCard size="responsive" variant="primary">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Account Overview</h2>
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowBalances(!showBalances)} className="px-3 py-2 rounded-lg border bg-black/10">
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button className="px-3 py-2 rounded-lg border bg-black/10">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
            <h3 className="text-sm text-muted-foreground mb-2">Total Net Worth</h3>
            <div className="text-3xl text-blue-600 font-semibold">
              {showBalances ? `$${totalNetWorth.toLocaleString()}` : "••••••"}
            </div>
            <div className="flex items-center justify-center mt-2 text-emerald-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              +5.2% this month
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
            <h3 className="text-sm text-muted-foreground mb-2">Total Assets</h3>
            <div className="text-3xl text-emerald-600 font-semibold">
              {showBalances ? `$${totalAssets.toLocaleString()}` : "••••••"}
            </div>
            <div className="text-foreground/60 text-sm mt-2">Liquid + Investments</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20">
            <h3 className="text-sm text-muted-foreground mb-2">Total Liabilities</h3>
            <div className="text-3xl text-red-500 font-semibold">
              {showBalances ? `$${totalLiabilities.toLocaleString()}` : "••••••"}
            </div>
            <div className="text-foreground/60 text-sm mt-2">Credit & Debt</div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((account) => {
          const IconComponent = getAccountIcon(account.type);
          return (
            <GlassCard
              key={account.id}
              size="responsive"
              className="hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full grid place-items-center ${
                        account.type === "credit"
                          ? "bg-red-500/20"
                          : account.type === "savings"
                          ? "bg-emerald-500/20"
                          : account.type === "investment"
                          ? "bg-purple-500/20"
                          : "bg-blue-500/20"
                      }`}
                    >
                      <span className="text-lg">{account.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className={`text-2xl font-semibold ${
                      account.balance >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {showBalances ? `${account.balance >= 0 ? "$" : "-$"}${Math.abs(account.balance).toLocaleString()}` : "••••••"}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last sync: {account.lastSync}</span>
                    <div
                      className={`flex items-center ${
                        account.trend >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      <TrendingUp className={`w-3 h-3 mr-1 ${account.trend < 0 ? "rotate-180" : ""}`} />
                      {Math.abs(account.trend).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}

        <GlassCard
          size="responsive"
          className="border-dashed border-2 border-foreground/20 hover:border-foreground/40 cursor-pointer flex items-center justify-center min-h-[150px]"
        >
          <div className="text-center">
            <Plus className="w-8 h-8 text-foreground/60 mx-auto mb-3" />
            <div className="font-medium">Add Account</div>
            <div className="text-sm text-muted-foreground">Connect bank or wallet</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
