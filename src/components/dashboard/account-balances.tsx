"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAccounts } from "@/lib/mock-data";
import { CURRENCY_SYMBOLS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Account } from "@/types";

const TYPE_COLORS: Record<Account["type"], string> = {
  checking: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  savings:  "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  credit:   "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
};

export function AccountBalances(): React.JSX.Element {
  const [hidden, setHidden] = useState(false);
  const [usdRate, setUsdRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        const usd = data.rates?.find((r: { currency: string; rate: number }) => r.currency === "USD/TRY");
        if (usd) setUsdRate(usd.rate);
      })
      .catch(() => null);
  }, []);

  const totalTRY = mockAccounts
    .filter((a) => a.currency === "TRY")
    .reduce((s, a) => s + a.balance, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Hesap Bakiyeleri</CardTitle>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={hidden ? "Bakiyeleri göster" : "Bakiyeleri gizle"}
            onClick={() => setHidden((h) => !h)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <Link href="/accounts" className="text-xs text-primary hover:underline">
            Tümü
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="mb-3 rounded-xl bg-muted/40 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">Toplam Net (TRY)</p>
          {hidden ? (
            <p className="text-xl font-bold mt-0.5">₺ ••••••</p>
          ) : (
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-muted-foreground text-sm">₺</span>
              <span className={cn("text-xl font-bold", totalTRY < 0 && "text-red-500")}>
                {Math.abs(totalTRY).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          {mockAccounts.map((acc) => {
            const symbol = CURRENCY_SYMBOLS[acc.currency];
            const abs = Math.abs(acc.balance);
            const isNeg = acc.balance < 0;
            const tryEquivalent = acc.currency === "USD" && usdRate ? acc.balance * usdRate : null;
            return (
              <div
                key={acc.id}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={cn("h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0", TYPE_COLORS[acc.type])}>
                    {acc.currency}
                  </div>
                  <div>
                    <p className="text-xs font-medium leading-tight">{acc.name}</p>
                    {acc.cardNumber && (
                      <p className="text-[10px] text-muted-foreground font-mono">{acc.cardNumber}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {hidden ? (
                    <span className="text-sm font-semibold">{symbol} ••••</span>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-0.5 justify-end">
                        <span className="text-[10px] text-muted-foreground">{symbol}</span>
                        <span className={cn("text-sm font-semibold tabular-nums font-mono", isNeg && "text-red-500")}>
                          {abs.toFixed(2)}
                        </span>
                      </div>
                      {tryEquivalent !== null && (
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          ≈ ₺{tryEquivalent.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}