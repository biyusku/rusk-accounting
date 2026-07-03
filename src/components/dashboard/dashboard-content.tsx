"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { CurrencyMarquee } from "@/components/dashboard/currency-marquee";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { InvoiceSummary } from "@/components/dashboard/invoice-summary";
import { BudgetMini } from "@/components/dashboard/budget-mini";
import { TransactionsFeed } from "@/components/dashboard/transactions-feed";
import { AccountsOverview } from "@/components/dashboard/accounts-overview";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
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
            <p className="text-muted-foreground text-sm mt-0.5">Son güncelleme: {timeLabel}</p>
          </div>
          <span className="text-sm font-semibold text-foreground bg-muted px-3 py-1.5 rounded-lg border">
            {monthLabel}
          </span>
        </div>
      </BlurFade>

      {/* Döviz Marquee */}
      {prefs.showCurrencyMarquee && (
        <BlurFade delay={0.04}>
          <CurrencyMarquee />
        </BlurFade>
      )}

      {/* KPI Kartlar */}
      {prefs.showKPICards && (
        <BlurFade delay={0.08}>
          <KPICards />
        </BlurFade>
      )}

      {/* Orta Satır: Nakit Akışı Grafiği + Fatura Durumu */}
      <BlurFade delay={0.12}>
        <div className="grid w-full gap-5 grid-cols-1 xl:grid-cols-2 items-start">
          <CashFlowChart />
          {prefs.showInvoiceStatus && <InvoiceSummary />}
        </div>
      </BlurFade>

      {/* Alt Satır: Hesaplar + Son İşlemler + Hızlı İşlemler + Bütçe */}
      <BlurFade delay={0.16}>
        <div className="grid w-full gap-5 grid-cols-1 xl:grid-cols-3 items-start">

          {/* Sol 2/3 — Hesaplar + Son İşlemler */}
          <div className="xl:col-span-2 space-y-5">
            {prefs.showAccountsOverview && <AccountsOverview />}
            {prefs.showTransactionsFeed && <TransactionsFeed />}
          </div>

          {/* Sağ 1/3 — Hızlı İşlemler + Bütçe */}
          <div className="space-y-5">
            {prefs.showQuickActions && <QuickActions />}
            {prefs.showBudgetMini && <BudgetMini />}
          </div>

        </div>
      </BlurFade>

    </div>
  );
}