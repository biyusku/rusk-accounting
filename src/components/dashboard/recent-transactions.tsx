"use client";

import { AnimatedList } from "@/components/ui/animated-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTransactions } from "@/lib/mock-data";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";
import Link from "next/link";

const STATUS_MAP: Record<Transaction["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "Tamamlandı", variant: "default" },
  pending: { label: "Bekliyor", variant: "secondary" },
  failed: { label: "Başarısız", variant: "destructive" },
};

function TransactionItem({ txn }: { txn: Transaction }): React.JSX.Element {
  const status = STATUS_MAP[txn.status];
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
          txn.type === "credit"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}
      >
        {txn.type === "credit" ? "+" : "-"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{txn.description}</p>
        <p className="text-xs text-muted-foreground">{txn.counterparty} · {formatShortDate(txn.date)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-sm font-semibold", txn.type === "credit" ? "text-emerald-600" : "text-red-500")}>
          {txn.type === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
        </p>
        <Badge variant={status.variant} className="text-[10px] h-4 mt-0.5">
          {status.label}
        </Badge>
      </div>
    </div>
  );
}

export function RecentTransactions(): React.JSX.Element {
  const recent = mockTransactions.slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Son İşlemler</CardTitle>
          <CardDescription>Son 6 banka hareketi</CardDescription>
        </div>
        <Link href="/transactions" className="text-sm text-primary hover:underline">
          Tümünü Gör
        </Link>
      </CardHeader>
      <CardContent>
        <AnimatedList delay={500} className="gap-2">
          {recent.map((txn) => (
            <TransactionItem key={txn.id} txn={txn} />
          ))}
        </AnimatedList>
      </CardContent>
    </Card>
  );
}