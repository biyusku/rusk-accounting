"use client";

import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, CreditCard, Landmark, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Account } from "@/types";

/* ─── Desteklenen Bankalar ─────────────────────────────────────── */
const SUPPORTED_BANKS = [
  { id: "isbank", name: "Türkiye İş Bankası", short: "İş Bankası", color: "#0057A8", tag: "Tam Destek" },
  { id: "ziraat", name: "Ziraat Bankası", short: "Ziraat", color: "#009639", tag: "Tam Destek" },
  { id: "halkbank", name: "Halkbank", short: "Halkbank", color: "#00539F", tag: "Tam Destek" },
  { id: "vakifbank", name: "VakıfBank", short: "VakıfBank", color: "#FFB800", tag: "Tam Destek" },
  { id: "garanti", name: "Garanti BBVA", short: "Garanti", color: "#00A650", tag: "Tam Destek" },
  { id: "akbank", name: "Akbank", short: "Akbank", color: "#EF3340", tag: "Tam Destek" },
  { id: "yapikredi", name: "Yapı Kredi", short: "Yapı Kredi", color: "#003087", tag: "Tam Destek" },
  { id: "teb", name: "Türk Ekonomi Bankası", short: "TEB", color: "#0072CE", tag: "Tam Destek" },
  { id: "denizbank", name: "DenizBank", short: "DenizBank", color: "#003DA5", tag: "Yakında" },
  { id: "odeabank", name: "Odeabank", short: "Odeabank", color: "#FF6600", tag: "Yakında" },
  { id: "kuveytturk", name: "Kuveyt Türk", short: "Kuveyt Türk", color: "#006B3C", tag: "Yakında" },
  { id: "other", name: "Diğer / Manuel", short: "Diğer", color: "#6b7280", tag: "Manuel" },
];

const ACCOUNT_TYPES = [
  { value: "checking", label: "Vadesiz Hesap", icon: Landmark },
  { value: "savings", label: "Tasarruf Hesabı", icon: Building2 },
  { value: "credit", label: "Kredi Kartı", icon: CreditCard },
] as const;

const CURRENCIES = ["TRY", "USD", "EUR"] as const;

type Step = "bank" | "form";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (account: Account) => void;
}

export function AddAccountDialog({ open, onOpenChange, onSuccess }: AddAccountDialogProps) {
  const [step, setStep] = useState<Step>("bank");
  const [selectedBank, setSelectedBank] = useState<typeof SUPPORTED_BANKS[0] | null>(null);

  // Form alanları
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings" | "credit">("checking");
  const [iban, setIban] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState<"TRY" | "USD" | "EUR">("TRY");
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setStep("bank");
    setSelectedBank(null);
    setName(""); setIban(""); setBalance(""); setCardNumber("");
    setAccountType("checking"); setCurrency("TRY");
  };

  const handleClose = (v: boolean) => {
    if (!v) resetForm();
    onOpenChange(v);
  };

  const handleBankSelect = (bank: typeof SUPPORTED_BANKS[0]) => {
    setSelectedBank(bank);
    if (bank.id !== "other") {
      setName(`${bank.short} `);
    }
    setStep("form");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBank) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        type: accountType,
        iban: iban.trim(),
        balance: parseFloat(balance) || 0,
        currency,
        bankName: selectedBank.name === "Diğer / Manuel" ? name.trim() : selectedBank.name,
      };
      if (accountType === "credit" && cardNumber.trim()) {
        body.cardNumber = cardNumber.trim();
      }

      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as Account & { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Hesap eklenemedi.");
        return;
      }
      toast.success("Hesap başarıyla eklendi.");
      onSuccess(data);
      handleClose(false);
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "bank" ? (
              <>
                <Building2 className="h-5 w-5 text-emerald-500" />
                Hesap Ekle — Banka Seç
              </>
            ) : (
              <>
                <div
                  className="h-5 w-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: selectedBank?.color }}
                >
                  {selectedBank?.short[0]}
                </div>
                {selectedBank?.short} — Hesap Bilgileri
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "bank"
              ? "Hesabınızın bağlı olduğu bankayı seçin."
              : "Hesap detaylarını girin. IBAN ve bakiye bilgileri isteğe bağlıdır."}
          </DialogDescription>
        </DialogHeader>

        {/* ADIM 1 — BANKA SEÇ */}
        {step === "bank" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPORTED_BANKS.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => handleBankSelect(bank)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all",
                    "hover:border-emerald-500/50 hover:bg-emerald-500/5",
                    bank.tag === "Yakında" && "opacity-60"
                  )}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: bank.color }}
                  >
                    {bank.short.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{bank.short}</p>
                    <Badge
                      className={cn(
                        "text-[10px] mt-1 px-1.5 py-0",
                        bank.tag === "Tam Destek" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        bank.tag === "Yakında" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                        bank.tag === "Manuel" && "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
                      )}
                    >
                      {bank.tag === "Tam Destek" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                      {bank.tag}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ADIM 2 — FORM */}
        {step === "form" && selectedBank && (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Hesap Türü */}
            <div className="space-y-2">
              <Label className="text-sm">Hesap Türü</Label>
              <div className="grid grid-cols-3 gap-2">
                {ACCOUNT_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAccountType(value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all text-sm",
                      accountType === value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                        : "hover:border-muted-foreground/30"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Hesap Adı */}
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="acc-name" className="text-sm">Hesap Adı</Label>
                <Input
                  id="acc-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="İş Bankası Vadesiz"
                  required
                />
              </div>

              {/* IBAN */}
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="acc-iban" className="text-sm">IBAN <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
                <Input
                  id="acc-iban"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="font-mono"
                />
              </div>

              {/* Bakiye */}
              <div className="space-y-1.5">
                <Label htmlFor="acc-balance" className="text-sm">Mevcut Bakiye <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
                <Input
                  id="acc-balance"
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Para Birimi */}
              <div className="space-y-1.5">
                <Label className="text-sm">Para Birimi</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as typeof currency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kredi Kartı Numarası */}
              {accountType === "credit" && (
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="acc-card" className="text-sm">Kart Numarası Son 4 Hane <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
                  <Input
                    id="acc-card"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="**** **** **** 1234"
                    maxLength={19}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep("bank")}>
                Geri
              </Button>
              <Button type="submit" disabled={loading || !name.trim()} className="bg-emerald-600 hover:bg-emerald-500">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hesabı Ekle"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}