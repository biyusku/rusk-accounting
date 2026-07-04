"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { getTransactions } from "@/lib/api";
import { formatCurrency, formatYAxis } from "@/lib/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CashFlowData } from "@/types";

function buildCashFlow(transactions: { date: string; amount: number; type: string }[]): CashFlowData[] {
  const months: Record<string, { gelir: number; gider: number }> = {};
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = d.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }) || `${d.getMonth() + 1}/${d.getFullYear()}`;
    if (!months[key]) months[key] = { gelir: 0, gider: 0 };
    if (t.type === "credit") months[key].gelir += t.amount;
    else months[key].gider += t.amount;
  });
  return Object.entries(months).map(([month, v]) => ({ month, ...v })).slice(-7);
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-background shadow-lg p-3 text-sm min-w-[140px]">
      <p className="font-semibold mb-1.5 text-xs text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4 text-xs">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart() {
  const [trendData, setTrendData] = useState<(CashFlowData & { net: number })[]>([]);

  useEffect(() => {
    getTransactions()
      .then((txns) => {
        const cf = buildCashFlow(txns);
        setTrendData(cf.map((m) => ({ ...m, net: m.gelir - m.gider })));
      })
      .catch(() => null);
  }, []);

  const lastNet = trendData[trendData.length - 1]?.net ?? 0;
  const prevNet = trendData[trendData.length - 2]?.net ?? 0;
  const change = prevNet !== 0 ? ((lastNet - prevNet) / Math.abs(prevNet)) * 100 : 0;
  const isPositive = lastNet >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Nakit Akışı</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Son 6 ay gelir — gider trendi</p>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
            isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
          )}>
            {isPositive
              ? <TrendingUp className="h-3.5 w-3.5" />
              : <TrendingDown className="h-3.5 w-3.5" />}
            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 10 }} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="gelir"
              name="Gelir"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 2.5 }}
            />
            <Line
              type="monotone"
              dataKey="gider"
              name="Gider"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}