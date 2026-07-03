"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";
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
import { toast } from "sonner";

const NAV_ITEMS = [
  { id: "profile", label: "Profil" },
  { id: "account", label: "Hesap" },
  { id: "appearance", label: "Görünüm" },
  { id: "notifications", label: "Bildirimler" },
  { id: "display", label: "Ekran" },
];

/* ---- Section Components ---- */

function ProfileSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profil</h3>
        <p className="text-sm text-muted-foreground">
          Bu bilgiler herkese açık olarak gösterilir. Dikkatli olun.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input id="username" defaultValue="rusk_kurumsal" className="max-w-sm" />
          <p className="text-xs text-muted-foreground">
            Bu, genel profil URL'nizde görünecek adınızdır. Yalnızca harf, rakam ve tire içerebilir.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Hakkında</Label>
          <Textarea
            id="bio"
            className="max-w-sm resize-none"
            rows={4}
            defaultValue="Rusk Kurumsal A.Ş. muhasebe yöneticisi."
          />
          <p className="text-xs text-muted-foreground">
            En fazla 160 karakter girebilirsiniz.
          </p>
        </div>
        <div className="space-y-2">
          <Label>URL'ler</Label>
          <Input placeholder="https://rusk.com.tr" className="max-w-sm" />
          <p className="text-xs text-muted-foreground">
            Web sitenizi veya profilinizi buraya ekleyin.
          </p>
        </div>
      </div>
      <Button onClick={onSave}>Profili Güncelle</Button>
    </div>
  );
}

function AccountSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Hesap</h3>
        <p className="text-sm text-muted-foreground">
          Hesap ayarlarınızı güncelleyin.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Ad Soyad</Label>
          <Input id="name" defaultValue="Rusk Kurumsal" className="max-w-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Doğum Tarihi</Label>
          <Input id="dob" type="date" className="max-w-sm" />
          <p className="text-xs text-muted-foreground">
            Doğum tarihiniz herkese açık profilde görünmez.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Dil</Label>
          <Select defaultValue="tr">
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Gösterge panelinde kullanılacak dildir.
          </p>
        </div>
      </div>
      <Button onClick={onSave}>Hesabı Güncelle</Button>
    </div>
  );
}

function AppearanceSection({ onSave }: { onSave: () => void }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [font, setFont] = useState("inter");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Görünüm</h3>
        <p className="text-sm text-muted-foreground">
          Temanızı ve font tercihlerinizi özelleştirin.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Font</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="manrope">Manrope</SelectItem>
              <SelectItem value="system">Sistem Fontu</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Gösterge panelinde kullanılacak fonttur.
          </p>
        </div>
        <div className="space-y-3">
          <Label>Tema</Label>
          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors",
                  theme === t
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-full rounded-md border",
                    t === "light" && "bg-white",
                    t === "dark" && "bg-zinc-900",
                    t === "system" && "bg-gradient-to-r from-white to-zinc-900"
                  )}
                />
                <span className="text-xs capitalize text-muted-foreground">
                  {t === "light" ? "Açık" : t === "dark" ? "Koyu" : "Sistem"}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Gösterge paneli için tema seçin.
          </p>
        </div>
      </div>
      <Button onClick={onSave}>Görünümü Güncelle</Button>
    </div>
  );
}

function NotificationsSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Bildirimler</h3>
        <p className="text-sm text-muted-foreground">
          Hangi bildirimleri almak istediğinizi ayarlayın.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Bildirim Gönderme Yöntemi</h4>
          <div className="space-y-3">
            {[
              { id: "email", label: "E-posta", desc: "admin@rusk.com.tr adresine gönder" },
              { id: "push", label: "Uygulama İçi", desc: "Tarayıcı bildirimleri" },
              { id: "sms", label: "SMS", desc: "Telefon numaranıza gönderin" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 max-w-lg">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.id === "email"} />
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-medium mb-3">Bildirim Türleri</h4>
          <div className="space-y-3">
            {[
              { label: "Yeni İşlemler", desc: "Hesabınıza yeni bir işlem geldiğinde" },
              { label: "Fatura Hatırlatmaları", desc: "Vadesi yaklaşan faturalar için" },
              { label: "Güvenlik Uyarıları", desc: "Şüpheli giriş denemeleri için" },
              { label: "Haftalık Özet", desc: "Her pazartesi finansal özet" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border p-3 max-w-lg">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button onClick={onSave}>Bildirimleri Güncelle</Button>
    </div>
  );
}

function DisplaySection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Ekran</h3>
        <p className="text-sm text-muted-foreground">
          Kenar çubuğunda hangi öğelerin gösterileceğini seçin.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Kenar Çubuğu Öğeleri</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Görmek istediğiniz sayfaları seçin.
          </p>
          <div className="space-y-2 max-w-sm">
            {[
              "Dashboard",
              "İşlemler",
              "Hesaplar",
              "Transfer",
              "Faturalar",
              "Raporlar",
              "Bütçe",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border p-2.5">
                <Switch defaultChecked />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button onClick={onSave}>Ekranı Güncelle</Button>
    </div>
  );
}

const SECTION_MAP = {
  profile: ProfileSection,
  account: AccountSection,
  appearance: AppearanceSection,
  notifications: NotificationsSection,
  display: DisplaySection,
};

export default function SettingsPage(): React.JSX.Element {
  const [active, setActive] = useState("profile");

  const handleSave = () => {
    toast.success("Ayarlar kaydedildi.");
  };

  const ActiveSection = SECTION_MAP[active as keyof typeof SECTION_MAP];

  return (
    <BlurFade delay={0} inView>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
          <p className="text-sm text-muted-foreground">
            Hesabınızı ve uygulama tercihlerinizi yönetin.
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sol nav */}
          <nav className="flex flex-row gap-1 md:flex-col md:w-48 shrink-0">
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
          <div className="flex-1 min-w-0">
            <ActiveSection onSave={handleSave} />
          </div>
        </div>
      </div>
    </BlurFade>
  );
}