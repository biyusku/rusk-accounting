"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { CurrencyMarquee } from "@/components/dashboard/currency-marquee";
import { AccountBalances } from "@/components/dashboard/account-balances";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { InvoiceSummary } from "@/components/dashboard/invoice-summary";
import { BudgetMini } from "@/components/dashboard/budget-mini";
import { TransactionsFeed } from "@/components/dashboard/transactions-feed";
import { AccountsOverview } from "@/components/dashboard/accounts-overview";
import { useDashboardPrefs } from "@/contexts/dashboard-prefs";

export function DashboardContent({ monthLabel, timeLabel }: { monthLabel: string; timeLabel: string }) {
  const { prefs } = useDashboardPrefs();

  return (
    <div className="w-full space-y-5">

      {/* Header */}
      <BlurFade delay={0}>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Genel Bakış</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Son güncelleme: {timeLabel}
            </p>
          </div>
          <span className="text-sm font-semibold text-foreground bg-muted px-3 py-1.5 rounded-lg border">
            {monthLabel}
          </span>
        </div>
      </BlurFade>

      {/* Döviz Marquee */}
      {prefs.showCurrencyMarquee && (
        <BlurFade delay={0.05}>
          <CurrencyMarquee />
        </BlurFade>
      )}

      {/* KPI Kartlar */}
      {prefs.showKPICards && (
        <BlurFade delay={0.1}>
          <KPICards />
        </BlurFade>
      )}

      {/* Ana responsive layout */}
      <BlurFade delay={0.15}>
        <div className="grid w-full gap-5 grid-cols-1 xl:grid-cols-2 items-start">

          {/* Sütun 1 — Sol Panel */}
          <div className="w-full min-w-0 space-y-5">
            {prefs.showAccountsOverview && <AccountsOverview />}
            {prefs.showTransactionsFeed && <TransactionsFeed />}
          </div>

          {/* Sütun 2 — Sağ Panel */}
          <div className="w-full min-w-0 space-y-5">
            {prefs.showQuickActions && <QuickActions />}
            {prefs.showAccountBalances && <AccountBalances />}
            {prefs.showInvoiceStatus && <InvoiceSummary />}
            {prefs.showBudgetMini && <BudgetMini />}
          </div>

        </div>
      </BlurFade>

    </div>
  );
}