"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BankIntegrationsSection } from "@/components/layout/bank-integrations-section";
import { toast } from "sonner";

/** ---- Nav items ---- */
const NAV_ITEMS = [
  { id: "profile", label: "Profil" },
  { id: "account", label: "Hesap" },
  { id: "appearance", label: "Görünüm" },
  { id: "notifications", label: "Bildirimler" },
  { id: "banks", label: "Banka Entegrasyonları" },
  { id: "display", label: "Ekran" },
];

/** ---- Section components ---- */

function ProfileSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-medium">Profil</h3>
        <p className="text-sm text-muted-foreground">Bu bilgiler herkese açık olarak gösterilir.</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input id="username" defaultValue="rusk_kurumsal" />
          <p className="text-xs text-muted-foreground">Yalnızca harf, rakam ve tire içerebilir.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Hakkında</Label>
          <Textarea id="bio" className="resize-none" rows={3} defaultValue="Rusk Kurumsal A.Ş. muhasebe yöneticisi." />
        </div>
        <div className="space-y-1.5">
          <Label>URL</Label>
          <Input placeholder="https://rusk.com.tr" />
        </div>
      </div>
      <Button size="sm" onClick={onSave}>Profili Güncelle</Button>
    </div>
  );
}

function AccountSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-medium">Hesap</h3>
        <p className="text-sm text-muted-foreground">Hesap ayarlarınızı güncelleyin.</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Ad Soyad</Label>
          <Input id="name" defaultValue="Rusk Kurumsal" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" defaultValue="admin@rusk.com.tr" />
        </div>
        <div className="space-y-1.5">
          <Label>Dil</Label>
          <Select defaultValue="tr">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button size="sm" onClick={onSave}>Hesabı Güncelle</Button>
    </div>
  );
}

function AppearanceSection({ onSave }: { onSave: () => void }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-medium">Görünüm</h3>
        <p className="text-sm text-muted-foreground">Tema ve font tercihlerinizi özelleştirin.</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Font</Label>
          <Select defaultValue="inter">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="manrope">Manrope</SelectItem>
              <SelectItem value="system">Sistem Fontu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tema</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-2.5 transition-colors",
                  theme === t ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "h-6 w-full rounded border",
                  t === "light" && "bg-white",
                  t === "dark" && "bg-zinc-900",
                  t === "system" && "bg-gradient-to-r from-white to-zinc-900"
                )} />
                <span className="text-xs text-muted-foreground">
                  {t === "light" ? "Açık" : t === "dark" ? "Koyu" : "Sistem"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <Button size="sm" onClick={onSave}>Görünümü Güncelle</Button>
    </div>
  );
}

function NotificationsSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-medium">Bildirimler</h3>
        <p className="text-sm text-muted-foreground">Hangi bildirimleri almak istediğinizi ayarlayın.</p>
      </div>
      <Separator />
      <div className="space-y-3">
        {[
          { label: "E-posta Bildirimleri", desc: "İşlemler için e-posta alın", def: true },
          { label: "SMS Bildirimleri", desc: "Kritik işlemler için SMS alın", def: false },
          { label: "Fatura Hatırlatmaları", desc: "Vadesi yaklaşan faturalar için", def: true },
          { label: "Haftalık Özet", desc: "Her pazartesi finansal özet", def: true },
          { label: "Güvenlik Uyarıları", desc: "Şüpheli giriş denemeleri için", def: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch defaultChecked={item.def} />
          </div>
        ))}
      </div>
      <Button size="sm" onClick={onSave}>Bildirimleri Güncelle</Button>
    </div>
  );
}

function DisplaySection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-medium">Ekran</h3>
        <p className="text-sm text-muted-foreground">Kenar çubuğunda hangi öğelerin gösterileceğini seçin.</p>
      </div>
      <Separator />
      <div className="space-y-2">
        {["Dashboard", "İşlemler", "Hesaplar", "Transfer", "Faturalar", "Raporlar", "Bütçe"].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-md border p-2.5">
            <Switch defaultChecked />
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>
      <Button size="sm" onClick={onSave}>Ekranı Güncelle</Button>
    </div>
  );
}

const SECTION_MAP = {
  profile: ProfileSection,
  account: AccountSection,
  appearance: AppearanceSection,
  notifications: NotificationsSection,
  display: DisplaySection,
  banks: BankIntegrationsSection,
};

/** ---- Main Dialog ---- */
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [active, setActive] = useState("profile");

  const handleSave = () => {
    toast.success("Ayarlar kaydedildi.");
  };

  const ActiveSection = SECTION_MAP[active as keyof typeof SECTION_MAP];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-5xl h-[88vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-xl font-bold">Ayarlar</DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hesabınızı ve uygulama tercihlerinizi yönetin.
          </p>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sol nav */}
          <nav className="w-56 shrink-0 border-r px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  active === item.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Sağ içerik */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <ActiveSection onSave={handleSave} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
