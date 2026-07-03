"use client";

import { TrendingUp, TrendingDown, FileText, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockKPI } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatters";

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  decimalPlaces?: number;
  icon: React.ReactNode;
  highlight?: boolean;
}

function KPICard({
  title,
  value,
  change,
  prefix = "",
  suffix = "",
  subtitle,
  decimalPlaces = 0,
  icon,
  highlight = false,
}: KPICardProps): React.JSX.Element {
  const isPositive = change >= 0;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-lg font-semibold text-muted-foreground">{prefix}</span>}
          <span className="text-3xl font-bold tracking-tight">
            {decimalPlaces > 0 ? value.toFixed(decimalPlaces) : formatNumber(value)}
          </span>
          {suffix && <span className="text-lg font-semibold text-muted-foreground">{suffix}</span>}
        </div>
        <div className={cn(
          "flex items-center gap-1 mt-2 text-sm font-semibold",
          isPositive ? "text-emerald-600" : "text-red-500"
        )}>
          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{isPositive ? "+" : ""}{change.toFixed(1)}% geçen aya göre</span>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function KPICards(): React.JSX.Element {
  const kpi = mockKPI;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <KPICard
        title="Toplam Gelir"
        value={kpi.totalRevenue}
        change={kpi.revenueChange}
        prefix="₺"
        icon={<TrendingUp className="h-4 w-4" />}
        highlight
      />
      <KPICard
        title="Toplam Gider"
        value={kpi.totalExpenses}
        change={kpi.expensesChange}
        prefix="₺"
        icon={<TrendingDown className="h-4 w-4" />}
      />
      <KPICard
        title="Net Kar"
        value={kpi.netProfit}
        change={kpi.profitChange}
        prefix="₺"
        icon={<DollarSign className="h-4 w-4" />}
        highlight
      />
      <KPICard
        title="Bekleyen Fatura"
        value={kpi.pendingInvoicesAmount}
        change={kpi.pendingChange}
        prefix="₺"
        subtitle={`${kpi.pendingInvoices} adet fatura`}
        icon={<FileText className="h-4 w-4" />}
      />
    </div>
  );
}