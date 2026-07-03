"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTransactions } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { STATUS_MAP, TYPE_LABELS } from "@/lib/constants";

const FILTERS = ["Tümü", "Gelir", "Gider"] as const;
type Filter = (typeof FILTERS)[number];

export function TransactionsFeed(): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>("Tümü");

  const data = mockTransactions.filter((t) => {
    if (filter === "Gelir") return t.type === "credit";
    if (filter === "Gider") return t.type === "debit";
    return true;
  });

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Son Hesap Hareketleri</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Link href="/transactions" className="text-xs text-primary hover:underline">
            Tümü
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        <div className="divide-y">
          {data.slice(0, 5).map((txn) => {
            const status = STATUS_MAP[txn.status];
            return (
              <div
                key={txn.id}
                className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors"
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                    txn.type === "credit"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {txn.type === "credit" ? "+" : "−"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{txn.description}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {txn.counterparty} · {formatDate(txn.date)}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 space-y-0.5">
                  <p
                    className={cn(
                      "text-sm font-semibold font-mono tabular-nums",
                      txn.type === "credit" ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {txn.type === "credit" ? "+" : "−"}{formatCurrency(txn.amount)}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium",
                      status.className
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t">
          <Link
            href="/transactions"
            className="flex h-8 w-full items-center justify-center rounded-md border border-input bg-background text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Tüm İşlemleri Gör
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}