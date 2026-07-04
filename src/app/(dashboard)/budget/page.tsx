"use client";

import { useState, useEffect } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { Progress } from "@/components/ui/progress";
import { getBudgets } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Budget } from "@/types";

function getCurrentMonthLabel(): string {
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date());
}

export default function BudgetPage(): React.JSX.Element {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBudgets()
      .then(setBudgets)
      .catch(() => toast.error("Bütçe verileri yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const monthLabel = getCurrentMonthLabel();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0} inView>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bütçe Takibi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {monthLabel} aylık bütçe kullanımı
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} inView>
        <Card>
          <CardHeader>
            <CardTitle>Genel Bütçe Durumu</CardTitle>
            <CardDescription>
              Toplam limit: {formatCurrency(totalLimit)} — Harcanan: {formatCurrency(totalSpent)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <AnimatedCircularProgressBar
              max={100}
              value={overallPercent}
              min={0}
              gaugePrimaryColor={
                overallPercent >= 90
                  ? "hsl(var(--destructive))"
                  : overallPercent >= 75
                  ? "hsl(var(--chart-4))"
                  : "hsl(var(--chart-2))"
              }
              gaugeSecondaryColor="hsl(var(--muted))"
              className="h-48 w-48"
            />
          </CardContent>
        </Card>
      </BlurFade>

      <BlurFade delay={0.2} inView>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {budgets.map((budget, i) => {
            const percent = Math.round((budget.spent / budget.limit) * 100);
            const isOverBudget = percent >= 100;
            const isWarning = percent >= 80;

            return (
              <BlurFade key={String(budget.id)} delay={0.2 + i * 0.05} inView>
                <Card className={cn(isOverBudget && "border-destructive/50")}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{budget.icon}</span>
                        <span className="font-medium text-sm">{budget.category}</span>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums",
                          isOverBudget ? "text-destructive" : isWarning ? "text-yellow-600" : "text-emerald-600"
                        )}
                      >
                        %{percent}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percent, 100)}
                      className={cn(
                        "h-2",
                        isOverBudget
                          ? "[&>div]:bg-destructive"
                          : isWarning
                          ? "[&>div]:bg-yellow-500"
                          : "[&>div]:bg-emerald-500"
                      )}
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Harcanan: <span className="font-mono tabular-nums">{formatCurrency(budget.spent)}</span></span>
                      <span>Limit: <span className="font-mono tabular-nums">{formatCurrency(budget.limit)}</span></span>
                    </div>
                  </CardContent>
                </Card>
              </BlurFade>
            );
          })}
        </div>
      </BlurFade>
    </div>
  );
}