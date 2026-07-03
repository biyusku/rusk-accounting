import Link from "next/link";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockBudgets } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function BudgetMini(): React.JSX.Element {
  const top = mockBudgets
    .slice()
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
    .slice(0, 4);

  const overBudgetCount = top.filter((b) => (b.spent / b.limit) >= 0.9).length;

  return (
    <Card className={cn(overBudgetCount > 0 && "border-red-200 dark:border-red-900/50")}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold">Bütçe Özeti</CardTitle>
          {overBudgetCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/40">
              <AlertTriangle className="h-3 w-3" />
              {overBudgetCount} aşım
            </span>
          )}
        </div>
        <Link href="/budget" className="text-xs text-primary hover:underline">
          Tümü
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {top.map((b) => {
          const pct = Math.min(Math.round((b.spent / b.limit) * 100), 100);
          const over = pct >= 90;
          const warn = pct >= 70;
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{b.icon}</span>
                  <span className="text-sm font-medium">{b.category}</span>
                  {over && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums min-w-[36px] text-right",
                      over ? "text-red-500" : warn ? "text-yellow-600 dark:text-yellow-400" : "text-emerald-600"
                    )}
                  >
                    %{pct}
                  </span>
                </div>
              </div>
              <Progress
                value={pct}
                className={cn(
                  "h-2",
                  over
                    ? "[&>div]:bg-red-500"
                    : warn
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-emerald-500"
                )}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}