import { BlurFade } from "@/components/ui/blur-fade";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { CurrencyMarquee } from "@/components/dashboard/currency-marquee";
import { AccountBalances } from "@/components/dashboard/account-balances";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { InvoiceSummary } from "@/components/dashboard/invoice-summary";
import { BudgetMini } from "@/components/dashboard/budget-mini";
import { TransactionsFeed } from "@/components/dashboard/transactions-feed";
import { AccountsOverview } from "@/components/dashboard/accounts-overview";

function getCurrentMonthLabel(): string {
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date());
}

function getLastUpdatedLabel(): string {
  const now = new Date();
  const date = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(now);
  const time = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(now);
  return `${date} ${time}`;
}

export default function DashboardPage(): React.JSX.Element {
  const monthLabel = getCurrentMonthLabel();
  const timeLabel = getLastUpdatedLabel();

  return (
    <div className="w-full space-y-5">

      {/* Header */}
      <BlurFade delay={0}>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Genel Bakış</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Son güncelleme: bugün {timeLabel}
            </p>
          </div>
          <span className="text-sm font-semibold text-foreground bg-muted px-3 py-1.5 rounded-lg border">
            {monthLabel}
          </span>
        </div>
      </BlurFade>

      {/* Döviz Marquee */}
      <BlurFade delay={0.05}>
        <CurrencyMarquee />
      </BlurFade>

      {/* KPI Kartlar */}
      <BlurFade delay={0.1}>
        <KPICards />
      </BlurFade>

      {/* Ana responsive layout */}
      <BlurFade delay={0.15}>
        <div className="grid w-full gap-5 grid-cols-1 xl:grid-cols-2 items-start">

          {/* Sütun 1 — Sol Panel */}
          <div className="w-full min-w-0 space-y-5">
            <AccountsOverview />
            <TransactionsFeed />
          </div>

          {/* Sütun 2 — Sağ Panel */}
          <div className="w-full min-w-0 space-y-5">
            <QuickActions />
            <AccountBalances />
            <InvoiceSummary />
            <BudgetMini />
          </div>

        </div>
      </BlurFade>

    </div>
  );
}