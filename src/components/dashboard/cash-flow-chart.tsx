"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockCashFlow } from "@/lib/mock-data";
import { formatYAxis } from "@/lib/formatters";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}): React.JSX.Element | null {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name === "gelir" ? "Gelir" : "Gider"}</span>
          </div>
          <span className="font-medium">
            ₺{p.value.toLocaleString("tr-TR")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart(): React.JSX.Element {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Nakit Akışı</CardTitle>
        <CardDescription>Son 7 ay gelir ve gider karşılaştırması</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={mockCashFlow} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gelirGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="giderGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="gelir"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fill="url(#gelirGradient)"
            />
            <Area
              type="monotone"
              dataKey="gider"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#giderGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-3 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-2))]" />
            <span className="text-muted-foreground">Gelir</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-1))]" />
            <span className="text-muted-foreground">Gider</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}