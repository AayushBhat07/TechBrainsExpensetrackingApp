import React from "react";
import { TransactionsPageHeader } from "@/components/transactions/TransactionsPageHeader";
import { AccountBalanceSection } from "@/components/transactions/AccountBalanceSection";
import { SpendingAnalyticsSection } from "@/components/transactions/SpendingAnalyticsSection";
import { RecurringPaymentsSection } from "@/components/transactions/RecurringPaymentsSection";
import { SmartCategorizationSection } from "@/components/transactions/SmartCategorizationSection";
import Hyperspeed from "@/components/Hyperspeed";

export default function Transactions() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-60">
        <Hyperspeed color="rgba(44,62,80,0.75)" glow="rgba(244,208,63,0.25)" />
      </div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),rgba(255,255,255,0.02))] pointer-events-none -z-10" />
      <div className="relative z-10 min-h-screen p-6 space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <TransactionsPageHeader />
          <AccountBalanceSection />
          <SpendingAnalyticsSection />
          <RecurringPaymentsSection />
          <SmartCategorizationSection />
        </div>
      </div>
    </div>
  );
}
