"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAccounts } from "@/lib/mock-data";
import type { Account } from "@/types";
import Link from "next/link";

const TYPE_LABELS: Record<Account["type"], string> = {
  checking: "Vadesiz",
  savings: "Tasarruf",
  credit: "Kredi Kartı",
};

const CURRENCY_SYMBOLS: Record<Account["currency"], string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

function AccountCard({ account }: { account: Account }): React.JSX.Element {
  const isCredit = account.type === "credit";
  const isNegative = account.balance < 0;
  const absBalance = Math.abs(account.balance);
  const symbol = CURRENCY_SYMBOLS[account.currency];

  if (isCredit) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-card p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.bankName}</p>
          </div>
          <Badge variant="destructive" className="text-xs">{TYPE_LABELS[account.type]}</Badge>
        </div>
        {account.cardNumber && (
          <p className="text-xs font-mono text-muted-foreground mb-2">{account.cardNumber}</p>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Güncel Borç</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm text-muted-foreground">{symbol}</span>
            <span className="text-xl font-bold text-red-500">{absBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium">{account.name}</p>
          <p className="text-xs text-muted-foreground">{account.bankName}</p>
        </div>
        <Badge variant="outline" className="text-xs">{TYPE_LABELS[account.type]}</Badge>
      </div>
      <p className="text-xs font-mono text-muted-foreground mb-2 truncate">{account.iban}</p>
      <div>
        <p className="text-xs text-muted-foreground">Bakiye</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-sm text-muted-foreground">{symbol}</span>
          <span className="text-xl font-bold">{absBalance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export function AccountsOverview(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hesaplar</CardTitle>
          <CardDescription>Bağlı banka hesapları</CardDescription>
        </div>
        <Link href="/accounts" className="text-sm text-primary hover:underline">
          Tümünü Gör
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mockAccounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}