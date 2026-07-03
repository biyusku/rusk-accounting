"use client";

import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { mockAccounts, mockTransactions } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { STATUS_MAP, TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowRightLeft, Zap, Building2, AlertCircle, Star, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/types";

const SAVED_RECIPIENTS = [
  { id: "sr-1", name: "ABC Ltd. Şirketi", iban: "TR33 0006 1005 1978 6457 8413 26", bank: "İş Bankası", category: "Tedarikçi" },
  { id: "sr-2", name: "XYZ Teknoloji", iban: "TR82 0004 6001 2345 6781 2345 67", bank: "Akbank", category: "Müşteri" },
  { id: "sr-3", name: "Gayrimenkul AŞ", iban: "TR55 0001 2009 8765 4321 0000 01", bank: "Garanti", category: "Kira" },
  { id: "sr-4", name: "Delta Corp", iban: "TR66 0003 2001 1234 5678 9012 34", bank: "Yapı Kredi", category: "Müşteri" },
  { id: "sr-5", name: "Sigma Holding", iban: "TR11 0017 3000 0001 2345 6789 01", bank: "Ziraat", category: "İş Ortağı" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Tedarikçi": "bg-blue-100 text-blue-700 border-blue-200",
  "Müşteri": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Kira": "bg-orange-100 text-orange-700 border-orange-200",
  "İş Ortağı": "bg-purple-100 text-purple-700 border-purple-200",
};

const TRANSFER_TYPES = [
  { id: "fast", label: "FAST", desc: "7/24 anlık transfer", limit: "₺150.000/işlem", icon: <Zap className="h-4 w-4 text-yellow-500" /> },
  { id: "eft", label: "EFT", desc: "Mesai saati içinde", limit: "₺5.000.000/işlem", icon: <Building2 className="h-4 w-4 text-blue-500" /> },
  { id: "havale", label: "Havale", desc: "Aynı banka, anlık", limit: "Limitsiz", icon: <ArrowRightLeft className="h-4 w-4 text-emerald-500" /> },
];

const recentTransfers = mockTransactions
  .filter((t) => t.type === "debit" && ["fast", "eft", "havale"].includes(t.transactionType))
  .slice(0, 6);

export default function TransfersPage(): React.JSX.Element {
  const [transferType, setTransferType] = useState("fast");
  const [fromAccount, setFromAccount] = useState(mockAccounts[0]?.id ?? "");
  const [iban, setIban] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fromAcc = mockAccounts.find((a) => a.id === fromAccount);

  const fillFromSaved = (r: typeof SAVED_RECIPIENTS[0]) => {
    setIban(r.iban);
    setRecipient(r.name);
    toast.info(`${r.name} seçildi.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iban || !amount || !recipient) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }
    const amt = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (isNaN(amt) || amt <= 0) {
      toast.error("Geçerli bir tutar girin.");
      return;
    }
    if (fromAcc && amt > fromAcc.balance) {
      toast.error("Hesap bakiyeniz yetersiz.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`${formatCurrency(amt)} tutarında ${TYPE_LABELS[transferType as Transaction["transactionType"]]} transferi gönderildi!`);
      setIban(""); setRecipient(""); setAmount(""); setDescription("");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <BlurFade delay={0} inView>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Para Transferi</h1>
          <p className="text-muted-foreground text-sm mt-1">FAST, EFT ve havale işlemleri</p>
        </div>
      </BlurFade>

      <BlurFade delay={0.08} inView>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

          {/* Sol — Transfer Formu */}
          <Card className="xl:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Yeni Transfer</CardTitle>
              <CardDescription>Alıcıya para gönderin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Transfer Türü */}
                <div className="grid grid-cols-3 gap-2">
                  {TRANSFER_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTransferType(t.id)}
                      className={cn(
                        "rounded-xl border-2 p-3 text-left transition-all",
                        transferType === t.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="mb-1.5">{t.icon}</div>
                      <p className="text-sm font-semibold">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                      <p className="text-[10px] text-muted-foreground">{t.limit}</p>
                    </button>
                  ))}
                </div>

                <Separator />

                {/* Gönderen Hesap */}
                <div className="space-y-1.5">
                  <Label>Gönderen Hesap</Label>
                  <Select value={fromAccount} onValueChange={setFromAccount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAccounts.filter((a) => a.balance > 0).map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <div className="flex items-center gap-2">
                            <span>{acc.name}</span>
                            <span className="text-muted-foreground text-xs font-mono">— {formatCurrency(acc.balance)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fromAcc && (
                    <p className="text-xs text-muted-foreground">
                      Kullanılabilir bakiye: <span className="font-semibold text-foreground">{formatCurrency(fromAcc.balance)}</span>
                    </p>
                  )}
                </div>

                {/* Alıcı Bilgileri */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Alıcı IBAN <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      value={iban}
                      onChange={(e) => setIban(e.target.value.toUpperCase())}
                      maxLength={32}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Alıcı Ad Soyad / Unvan <span className="text-red-500">*</span></Label>
                    <Input placeholder="Ad Soyad veya Şirket Adı" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                  </div>
                </div>

                {/* Tutar */}
                <div className="space-y-1.5">
                  <Label>Tutar (TRY) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₺</span>
                    <Input
                      className="pl-7 font-mono text-lg"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Açıklama */}
                <div className="space-y-1.5">
                  <Label>Açıklama</Label>
                  <Input placeholder="Ödeme açıklaması (opsiyonel)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={100} />
                </div>

                {/* Bilgi kutusu */}
                <div className="flex gap-2 rounded-xl bg-muted/40 border p-3">
                  <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {transferType === "fast" && "FAST transferleri 7/24 anlık gerçekleşir. Tek seferlik işlem limiti ₺150.000'dir."}
                    {transferType === "eft" && "EFT işlemleri hafta içi 08:00–17:00 saatleri arasında gerçekleşir. Aksi hâlde sonraki iş günü işleme alınır."}
                    {transferType === "havale" && "Havale işlemleri aynı banka hesapları arasında anlık gerçekleşir ve limit yoktur."}
                  </p>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Gönderiliyor...</>
                  ) : (
                    <><ArrowRightLeft className="h-4 w-4" />Transferi Gönder</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sağ Sütun */}
          <div className="xl:col-span-2 space-y-4">

            {/* Kayıtlı Ödemeler */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <CardTitle className="text-sm font-semibold">Kayıtlı Ödemeler</CardTitle>
                </div>
                <CardDescription>Sık kullandığınız alıcılar</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {SAVED_RECIPIENTS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => fillFromSaved(r)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{r.iban}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{r.bank}</span>
                          <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", CATEGORY_COLORS[r.category] ?? "bg-gray-100 text-gray-600")}>
                            {r.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Son Transferler */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Son Transferler</CardTitle>
                <CardDescription>Son gönderilen ödemeler</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentTransfers.map((t) => {
                    const status = STATUS_MAP[t.status];
                    return (
                      <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold">
                          {t.counterparty.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{t.counterparty}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{formatDate(t.date)}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] uppercase font-mono text-muted-foreground">{t.transactionType}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-red-500 font-mono tabular-nums">
                            −{formatCurrency(t.amount)}
                          </p>
                          <span className={cn("text-[10px] font-medium", status.className.includes("emerald") ? "text-emerald-600" : "text-yellow-600")}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </BlurFade>
    </div>
  );
}