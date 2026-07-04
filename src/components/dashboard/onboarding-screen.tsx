"use client";

/**
 * Yeni kullanıcı için "Başlarken" onboarding ekranı.
 * Dashboard'da hiç hesap yoksa gösterilir.
 */
import { Button } from "@/components/ui/button";
import { PlusCircle, Database, BarChart3, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SettingsDialog } from "@/components/layout/settings-dialog";

const STEPS = [
  {
    icon: PlusCircle,
    title: "Hesap Ekle",
    desc: "Banka hesapları ve kredi kartlarınızı bağlayın",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: FileText,
    title: "İşlemlerinizi Girin",
    desc: "Gelir ve giderlerinizi takip edin",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Raporları Görün",
    desc: "Finansal durumunuzu analiz edin",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = (await res.json()) as { message?: string; error?: string; counts?: unknown; skipped?: boolean };
      if (!res.ok || data.error) {
        toast.error(data.error ?? `Hata: HTTP ${res.status}`);
        return;
      }
      toast.success(data.skipped ? "Veri zaten mevcut, dashboard yükleniyor." : "Demo veriler yüklendi!");
      onComplete();
    } catch (err) {
      toast.error(`Veri yüklenirken hata: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 py-12">
      <div className="space-y-3">
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
          <Database className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Hoş Geldiniz!</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Henüz hiç veri yok. Demo verileri yükleyerek başlayın ya da
          hesaplarınızı manuel olarak ekleyin.
        </p>
      </div>

      {/* Adımlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border bg-card text-center"
          >
            <div className={`h-10 w-10 rounded-xl ${step.bg} flex items-center justify-center`}>
              <step.icon className={`h-5 w-5 ${step.color}`} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px]">{i + 1}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Aksiyonlar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSeedData}
          disabled={loading}
          className="gap-2 bg-emerald-600 hover:bg-emerald-500"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          Demo Verileri Yükle
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setSettingsOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          Hesap Ekle
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Demo veriler gerçek olmayan örnek verilerdir. İstediğinizde silebilirsiniz.
      </p>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} defaultTab="banks" />
    </div>
  );
}