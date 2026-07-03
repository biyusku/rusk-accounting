"use client";

import { useState, useMemo } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { mockCashFlow, mockBudgets, mockTransactions } from "@/lib/mock-data";
import { formatCurrency, formatYAxis } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Download, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { toast } from "sonner";

const CHART_COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(218 70% 55%)",
];

const PERIODS = [
  { id: "this-month", label: "Bu Ay" },
  { id: "last-month", label: "Geçen Ay" },
  { id: "q3", label: "Q3 2026" },
  { id: "ytd", label: "YTD 2026" },
];

// Pie chart için gider kategorileri
const pieData = mockBudgets
  .map((b) => ({ name: b.category, value: b.spent }))
  .sort((a, b) => b.value - a.value);

// Kategori bazlı işlem özeti
const categoryStats = Object.entries(
  mockTransactions
    .filter(t => t.type === "debit")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
)
  .map(([category, total]) => ({ category, total }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 6);

// Aylık trend — nakit akışı + kümülatif
const trendData = mockCashFlow.map((m, i, arr) => {
  const net = m.gelir - m.gider;
  const cumulative = arr.slice(0, i + 1).reduce((s, x) => s + (x.gelir - x.gider), 0);
  return { ...m, net, cumulative };
});

// Özet KPI
const totalRevenue  = mockTransactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
const totalExpenses = mockTransactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
const netProfit     = totalRevenue - totalExpenses;
const profitMargin  = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-background shadow-lg p-3 text-sm min-w-[150px]">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage(): React.JSX.Element {
  const [period, setPeriod] = useState("this-month");

  const handleExport = () => {
    toast.success("Rapor hazırlanıyor… İndirilecek.");
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <BlurFade delay={0} inView>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Raporlar</h1>
            <p className="text-muted-foreground text-sm mt-1">Finansal analiz ve dönem raporları</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Dönem Seçici */}
            <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    period === p.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" />
              Rapor İndir
            </Button>
          </div>
        </div>
      </BlurFade>

      {/* KPI Özet Kartları */}
      <BlurFade delay={0.08} inView>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Toplam Gelir", value: totalRevenue,
              change: "+12.4%", positive: true,
              icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
              color: "text-emerald-600",
            },
            {
              label: "Toplam Gider", value: totalExpenses,
              change: "−3.2%", positive: true,
              icon: <TrendingDown className="h-4 w-4 text-blue-500" />,
              color: "text-foreground",
            },
            {
              label: "Net Kâr", value: netProfit,
              change: "+28.7%", positive: true,
              icon: <ArrowUpRight className="h-4 w-4 text-emerald-500" />,
              color: netProfit >= 0 ? "text-emerald-600" : "text-red-500",
            },
            {
              label: "Kâr Marjı", value: null,
              display: `%${profitMargin.toFixed(1)}`,
              change: "+4.2pp", positive: true,
              icon: <Minus className="h-4 w-4 text-purple-500" />,
              color: "text-purple-600",
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {item.icon}
                </div>
                <p className={cn("text-xl font-bold font-mono tabular-nums", item.color)}>
                  {item.display ?? formatCurrency(item.value!)}
                </p>
                <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", item.positive ? "text-emerald-600" : "text-red-500")}>
                  {item.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {item.change} geçen aya göre
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </BlurFade>

      {/* Grafikler */}
      <BlurFade delay={0.15} inView>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Gelir-Gider Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Aylık Gelir & Gider</CardTitle>
              <CardDescription>Son 6 ay karşılaştırması</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockCashFlow} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => (v === "gelir" ? "Gelir" : "Gider")} />
                  <Bar dataKey="gelir" name="gelir" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gider" name="gider" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Net Kâr Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Net Kâr Trendi</CardTitle>
              <CardDescription>Aylık net ve kümülatif kâr</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="net" name="Net Kâr" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="cumulative" name="Kümülatif" stroke="hsl(var(--chart-4))" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gider Dağılımı Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Gider Dağılımı</CardTitle>
              <CardDescription>Kategoriye göre harcama oranları</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`₺${typeof v === "number" ? v.toLocaleString("tr-TR") : v}`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Kategori Bazlı Gider Analizi */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Kategori Analizi</CardTitle>
              <CardDescription>En yüksek gider kalemleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryStats.map((item, i) => {
                const pct = Math.round((item.total / totalExpenses) * 100);
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono tabular-nums">
                          {formatCurrency(item.total)}
                        </span>
                        <span className="text-xs font-bold tabular-nums w-8 text-right">%{pct}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Toplam Gider</span>
                <span className="font-mono">{formatCurrency(totalExpenses)}</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </BlurFade>
    </div>
  );
}