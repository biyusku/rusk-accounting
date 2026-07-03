"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mockAccounts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { SendHorizonal, Shield } from "lucide-react";

const schema = z.object({
  fromAccountId: z.string().min(1, "Hesap seçin"),
  toIban: z.string().min(26, "Geçerli bir IBAN girin").regex(/^TR/i, "IBAN TR ile başlamalı"),
  amount: z.string().min(1, "Tutar girin").refine((v) => !isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) > 0, "Geçerli tutar girin"),
  description: z.string().min(3, "Açıklama en az 3 karakter"),
  transferType: z.enum(["havale", "eft", "fast"]),
});

type FormValues = z.infer<typeof schema>;

const TRANSFER_INFO: Record<string, { label: string; desc: string; fee: string }> = {
  havale: { label: "Havale", desc: "Aynı banka içi anında transfer", fee: "Ücretsiz" },
  eft: { label: "EFT", desc: "Bankalararası transfer (iş günü 09:00-17:30)", fee: "₺2.50" },
  fast: { label: "FAST", desc: "7/24 anında bankalararası transfer", fee: "₺1.00" },
};

export default function TransferPage(): React.JSX.Element {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromAccountId: "",
      toIban: "",
      amount: "",
      description: "",
      transferType: "fast",
    },
  });

  const onSubmit = (values: FormValues): void => {
    setFormValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = (): void => {
    if (!formValues) return;
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setConfirmOpen(false);
      form.reset();
      toast.success("Transfer başarıyla gönderildi", {
        description: `${formatCurrency(Number(formValues.amount))} tutarındaki işleminiz işleme alındı.`,
      });
    }, 1500);
  };

  const selectedType = form.watch("transferType") as "havale" | "eft" | "fast";
  const typeInfo = TRANSFER_INFO[selectedType];
  const fromAccount = mockAccounts.find((a) => a.id === form.watch("fromAccountId"));

  return (
    <div className="space-y-6 max-w-2xl">
      <BlurFade delay={0} inView>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Para Transferi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Havale, EFT ve FAST ile hızlı ödeme
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} inView>
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Transfer Formu
            </CardTitle>
            <CardDescription>İş Bankası API üzerinden güvenli transfer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label>Gönderen Hesap</Label>
                <Select
                  value={form.watch("fromAccountId")}
                  onValueChange={(v) => form.setValue("fromAccountId", v ?? "", { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hesap seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts
                      .filter((a) => a.type !== "credit" && a.currency === "TRY")
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} — ₺{a.balance.toLocaleString("tr-TR")}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.fromAccountId && (
                  <p className="text-xs text-destructive">{form.formState.errors.fromAccountId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Alıcı IBAN</Label>
                <Input
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  {...form.register("toIban")}
                  className="font-mono"
                />
                {form.formState.errors.toIban && (
                  <p className="text-xs text-destructive">{form.formState.errors.toIban.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tutar (TRY)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₺</span>
                  <Input
                    placeholder="0,00"
                    className="pl-8"
                    {...form.register("amount")}
                  />
                </div>
                {fromAccount && (
                  <p className="text-xs text-muted-foreground">
                    Kullanılabilir: {formatCurrency(fromAccount.balance)}
                  </p>
                )}
                {form.formState.errors.amount && (
                  <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Transfer Türü</Label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => form.setValue("transferType", (v ?? "fast") as "havale" | "eft" | "fast")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRANSFER_INFO).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label} — {v.fee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {typeInfo && (
                  <p className="text-xs text-muted-foreground">{typeInfo.desc}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Input
                  placeholder="Ödeme açıklaması..."
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" size="lg">
                <SendHorizonal className="h-4 w-4" />
                Gönder
              </Button>
            </form>
          </CardContent>
        </Card>
      </BlurFade>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Onayı</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">Transfer detayları</AlertDialogDescription>
            <div className="space-y-2 mt-2">
                <div className="rounded-lg border p-3 text-sm space-y-1.5 bg-muted/30">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tutar</span>
                    <span className="font-semibold">{formatCurrency(Number(formValues?.amount ?? 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alıcı IBAN</span>
                    <span className="font-mono text-xs">{formValues?.toIban}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tür</span>
                    <span>{TRANSFER_INFO[formValues?.transferType ?? "fast"].label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Açıklama</span>
                    <span>{formValues?.description}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Bu işlem onaylandıktan sonra geri alınamaz.</p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={pending}>
              {pending ? "Gönderiliyor..." : "Onayla ve Gönder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}