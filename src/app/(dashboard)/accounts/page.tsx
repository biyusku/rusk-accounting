"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAccounts } from "@/lib/api";
import { formatIBAN } from "@/lib/formatters";
import { CURRENCY_SYMBOLS } from "@/lib/constants";
import type { Account } from "@/types";
import { cn } from "@/lib/utils";
import { Copy, Eye, EyeOff, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SettingsDialog } from "@/components/layout/settings-dialog";

const TYPE_LABELS: Record<Account["type"], string> = {
  checking: "Vadesiz Hesap",
  savings: "Tasarruf Hesabı",
  credit: "Kredi Kartı",
};

function AccountDetailCard({ account }: { account: Account }): React.JSX.Element {
  const [hidden, setHidden] = useState(false);
  const isCredit = account.type === "credit";
  const absBalance = Math.abs(account.balance);
  const symbol = CURRENCY_SYMBOLS[account.currency];

  const copyIBAN = (): void => {
    void navigator.clipboard.writeText(account.iban.replace(/\s/g, ""));
    toast.success("IBAN kopyalandı");
  };

  const content = (
    <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold">{account.name}</p>
          <p className="text-sm text-muted-foreground">{account.bankName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isCredit ? "destructive" : "outline"} className="text-xs">
            {TYPE_LABELS[account.type]}
          </Badge>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1">IBAN</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{formatIBAN(account.iban)}</span>
          <button
            type="button"
            aria-label="IBAN kopyala"
            onClick={copyIBAN}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs text-muted-foreground">{isCredit ? "Güncel Borç" : "Kullanılabilir Bakiye"}</p>
          <button
            type="button"
            aria-label={hidden ? "Bakiyeyi göster" : "Bakiyeyi gizle"}
            onClick={() => setHidden((h) => !h)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {hidden ? (
          <p className="text-2xl font-bold tracking-tight">{symbol} ••••••</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-muted-foreground">{symbol}</span>
            <span className={cn("text-2xl font-bold tracking-tight", isCredit && "text-red-500")}>
              {absBalance.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {account.cardNumber && (
        <p className="mt-3 text-xs font-mono text-muted-foreground">{account.cardNumber}</p>
      )}
    </div>
  );

  if (isCredit) {
    return (
      <ShineBorder className="rounded-xl p-[1px]" shineColor={["#f87171", "#fb923c"]}>
        <div className="rounded-xl bg-card">{content}</div>
      </ShineBorder>
    );
  }

  return (
    <MagicCard className="rounded-xl" gradientColor="hsl(var(--primary) / 0.06)">
      {content}
    </MagicCard>
  );
}

export default function AccountsPage(): React.JSX.Element {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => toast.error("Hesaplar yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <BlurFade delay={0} inView>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hesaplar</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Bağlı tüm banka ve kredi kartı hesapları
            </p>
          </div>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500" onClick={() => setSettingsOpen(true)}>
            <Plus className="h-4 w-4" />
            Hesap Ekle
          </Button>
        </div>
      </BlurFade>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Henüz hesap yok</p>
            <p className="text-sm text-muted-foreground mt-1">İlk hesabınızı ekleyerek başlayın</p>
          </div>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500" onClick={() => setSettingsOpen(true)}>
            <Plus className="h-4 w-4" />
            Hesap Ekle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accounts.map((account, i) => (
            <BlurFade key={String(account.id)} delay={0.1 + i * 0.05} inView>
              <AccountDetailCard account={account} />
            </BlurFade>
          ))}
        </div>
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultTab="banks"
      />
    </div>
  );
}