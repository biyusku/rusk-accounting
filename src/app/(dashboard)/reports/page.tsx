"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { mockCashFlow, mockBudgets } from "@/lib/mock-data";
import { formatYAxis } from "@/lib/formatters";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(218 70% 55%)",
];

const pieData = mockBudgets.map((b) => ({
  name: b.category,
  value: b.spent,
}));

export default function ReportsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <BlurFade delay={0} inView>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Raporlar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Finansal analiz ve dönem raporları
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} inView>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aylık Karşılaştırma</CardTitle>
              <CardDescription>Gelir ve gider bar grafiği</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockCashFlow} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [`₺${typeof v === "number" ? v.toLocaleString("tr-TR") : v}`, ""]}
                    labelClassName="font-semibold"
                  />
                  <Legend formatter={(v) => (v === "gelir" ? "Gelir" : "Gider")} />
                  <Bar dataKey="gelir" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gider" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gider Dağılımı</CardTitle>
              <CardDescription>Kategoriye göre harcama oranları</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CHART_COLORS[pieData.indexOf(entry) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`₺${typeof v === "number" ? v.toLocaleString("tr-TR") : v}`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </BlurFade>
    </div>
  );
}