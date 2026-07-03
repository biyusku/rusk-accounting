"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  Zap,
  Building2,
  CreditCard,
  ArrowRightLeft,
  BarChart3,
  FileText,
  RefreshCw,
  Unplug,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface BankAPI {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  beta?: boolean;
}

interface Bank {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  logoUrl: string;
  bgColor: string;
  textColor: string;
  status: "connected" | "disconnected" | "connecting";
  docUrl: string;
  authType: string;
  description: string;
  apis: BankAPI[];
}

const INITIAL_BANKS: Bank[] = [
  {
    id: "isbank",
    name: "Türkiye İş Bankası",
    shortName: "İş Bankası",
    logo: "İŞ",
    logoUrl: "/logos/isbank.png",
    bgColor: "bg-[#EF2D73]",
    textColor: "text-white",
    status: "connected",
    docUrl: "https://developer.isbank.com.tr",
    authType: "OAuth 2.0 + API Key",
    description: "Hesap hareketleri, para transferi, ödeme ve döviz kuru API'leri",
    apis: [
      { id: "isbank-accounts", name: "Hesap Bilgileri", description: "Bakiye ve IBAN sorgulama (5 API)", icon: <Building2 className="h-3.5 w-3.5" />, enabled: true },
      { id: "isbank-transfer", name: "Para Aktarma", description: "Havale, EFT, FAST (7 API)", icon: <ArrowRightLeft className="h-3.5 w-3.5" />, enabled: true },
      { id: "isbank-payments", name: "Ödemeler", description: "Fatura ödeme ve POS (14 API)", icon: <CreditCard className="h-3.5 w-3.5" />, enabled: true },
      { id: "isbank-cards", name: "Kartlar", description: "Kredi kartı hareketleri (6 API)", icon: <CreditCard className="h-3.5 w-3.5" />, enabled: false },
      { id: "isbank-data", name: "Veri Paylaşımı", description: "Finansal raporlama (24 API)", icon: <BarChart3 className="h-3.5 w-3.5" />, enabled: false, beta: true },
      { id: "isbank-fx", name: "Döviz Kuru", description: "TCMB ve İş Bankası kurları", icon: <RefreshCw className="h-3.5 w-3.5" />, enabled: true },
      { id: "isbank-supplier", name: "Tedarikçi Finansmanı", description: "Fatura iskonto yönetimi", icon: <FileText className="h-3.5 w-3.5" />, enabled: false, beta: true },
    ],
  },
  {
    id: "akbank",
    name: "Akbank T.A.Ş.",
    shortName: "Akbank",
    logo: "AK",
    logoUrl: "/logos/akbank.png",
    bgColor: "bg-[#E31E24]",
    textColor: "text-white",
    status: "disconnected",
    docUrl: "https://apiportal.akbank.com",
    authType: "OAuth 2.0 + Client Secret",
    description: "Döviz kurları, kredi oranları, sanal POS ve şube/ATM verileri",
    apis: [
      { id: "akbank-fx", name: "Döviz Kurları", description: "Tarihsel ve anlık kur verisi", icon: <RefreshCw className="h-3.5 w-3.5" />, enabled: false },
      { id: "akbank-credit-rates", name: "Kredi Faiz Oranları", description: "İhtiyaç, konut, taşıt kredisi oranları", icon: <BarChart3 className="h-3.5 w-3.5" />, enabled: false },
      { id: "akbank-payment-plan", name: "Kredi Ödeme Planı", description: "Vade bazlı ödeme hesaplama", icon: <FileText className="h-3.5 w-3.5" />, enabled: false },
      { id: "akbank-pos", name: "VirtualPOS & Cebe POS", description: "Sanal POS ve mobil POS işlemleri", icon: <CreditCard className="h-3.5 w-3.5" />, enabled: false, beta: true },
    ],
  },
  {
    id: "garanti",
    name: "Garanti BBVA",
    shortName: "Garanti",
    logo: "GB",
    logoUrl: "/logos/garanti.png",
    bgColor: "bg-[#009639]",
    textColor: "text-white",
    status: "disconnected",
    docUrl: "https://developer.garantibbva.com.tr",
    authType: "OAuth 2.0 (PSD2)",
    description: "PSD2 uyumlu açık bankacılık hesap ve ödeme başlatma API'leri",
    apis: [
      { id: "garanti-accounts", name: "Hesap & Bakiye", description: "PSD2 hesap bilgisi sorgulama", icon: <Building2 className="h-3.5 w-3.5" />, enabled: false },
      { id: "garanti-payments", name: "Ödeme Başlatma", description: "PSD2 uyumlu ödeme hizmetleri", icon: <ArrowRightLeft className="h-3.5 w-3.5" />, enabled: false },
      { id: "garanti-fx", name: "Döviz İşlemleri", description: "Döviz kuru ve çevrim hizmetleri", icon: <RefreshCw className="h-3.5 w-3.5" />, enabled: false },
    ],
  },
  {
    id: "ykb",
    name: "Yapı ve Kredi Bankası",
    shortName: "Yapı Kredi",
    logo: "YK",
    logoUrl: "/logos/ykb.png",
    bgColor: "bg-[#5B2D8E]",
    textColor: "text-white",
    status: "disconnected",
    docUrl: "https://developer.yapikredi.com.tr",
    authType: "OAuth 2.0",
    description: "Hesap hizmetleri, EFT/FAST/havale ve kart işlem API'leri",
    apis: [
      { id: "ykb-accounts", name: "Hesap Hizmetleri", description: "Hesap bilgileri ve işlem geçmişi", icon: <Building2 className="h-3.5 w-3.5" />, enabled: false },
      { id: "ykb-payments", name: "Ödeme Hizmetleri", description: "EFT, FAST ve havale işlemleri", icon: <ArrowRightLeft className="h-3.5 w-3.5" />, enabled: false },
      { id: "ykb-cards", name: "Kart Hizmetleri", description: "Kredi kartı hareketleri ve limit sorgusu", icon: <CreditCard className="h-3.5 w-3.5" />, enabled: false },
    ],
  },
];

function BankCard({ bank: initialBank }: { bank: Bank }) {
  const [bank, setBank] = useState(initialBank);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const enabledCount = bank.apis.filter((a) => a.enabled).length;
  const isConnected = bank.status === "connected";

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBank((b) => ({ ...b, status: "connected" }));
      setExpanded(true);
      toast.success(`${bank.shortName} başarıyla bağlandı!`);
    }, 1400);
  };

  const handleDisconnect = () => {
    setBank((b) => ({
      ...b,
      status: "disconnected",
      apis: b.apis.map((a) => ({ ...a, enabled: false })),
    }));
    setExpanded(false);
    toast.info(`${bank.shortName} bağlantısı kesildi.`);
  };

  const toggleAPI = (apiId: string) => {
    setBank((b) => ({
      ...b,
      apis: b.apis.map((a) => a.id === apiId ? { ...a, enabled: !a.enabled } : a),
    }));
  };

  return (
    <div className={cn(
      "rounded-2xl border-2 transition-all duration-300 overflow-hidden",
      isConnected
        ? "border-emerald-400/60 shadow-sm shadow-emerald-100"
        : "border-border hover:border-muted-foreground/20",
      expanded && "col-span-2"
    )}>
      <div className={cn("flex", expanded ? "flex-row" : "flex-col")}>
        {/* Sol — Banka Bilgisi */}
        <div className={cn("p-4 flex flex-col gap-3", expanded ? "w-56 shrink-0 border-r" : "")}>
          {/* Logo + İsim */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl overflow-hidden border bg-white flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={bank.logoUrl}
                alt={bank.name}
                className="h-9 w-9 object-contain"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  if (t.parentElement) t.parentElement.innerHTML = `<span class="text-xs font-black">${bank.logo}</span>`;
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold leading-tight truncate">{bank.name}</p>
              </div>
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full mt-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Bağlı
                </span>
              )}
            </div>
          </div>

          {/* Açıklama — sadece kapalıyken */}
          {!expanded && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{bank.description}</p>
          )}

          {/* Butonlar */}
          <div className={cn("flex items-center gap-2", expanded ? "mt-auto" : "pt-1 border-t border-dashed")}>
            {isConnected ? (
              <>
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className={cn(
                    "flex-1 text-[11px] font-medium px-3 py-2 rounded-lg border transition-all flex items-center justify-between gap-1 min-w-0",
                    expanded
                      ? "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      : "border-border hover:bg-muted/50 text-foreground hover:border-primary/40"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-primary" />
                    <span>{enabledCount}/{bank.apis.length} API Aktif</span>
                  </span>
                  {expanded
                    ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  title="Bağlantıyı kes"
                  className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"
                >
                  <Unplug className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs gap-1.5 font-medium"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="h-3 w-3 animate-spin" />Bağlanıyor...</>
                  : <><Zap className="h-3 w-3" />Bağlan</>}
              </Button>
            )}
          </div>
        </div>

        {/* Sağ — API Paneli */}
        {isConnected && expanded && (
          <div className="flex-1 bg-muted/20 p-4 overflow-y-auto">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              API Yönetimi — {bank.shortName}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {bank.apis.map((api) => (
                <div
                  key={api.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 transition-colors",
                    api.enabled ? "bg-background shadow-sm border" : "hover:bg-muted/60 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("shrink-0", api.enabled ? "text-primary" : "text-muted-foreground")}>
                      {api.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium truncate">{api.name}</p>
                        {api.beta && (
                          <Badge variant="outline" className="text-[9px] h-3.5 px-1 py-0 border-amber-300 text-amber-700 bg-amber-50 shrink-0">
                            BETA
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={api.enabled}
                    onCheckedChange={() => toggleAPI(api.id)}
                    className="scale-[0.75] shrink-0 ml-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BankIntegrationsSection() {
  const [banks] = useState(INITIAL_BANKS);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium">Banka Entegrasyonları</h3>
        <p className="text-sm text-muted-foreground">
          Banka API'lerini bağlayın, finans verilerinizi otomatik senkronize edin.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-3">
        {banks.map((bank) => (
          <BankCard key={bank.id} bank={bank} />
        ))}
      </div>
    </div>
  );
}