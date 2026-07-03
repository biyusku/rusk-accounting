"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  Circle,
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
  AlertTriangle,
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
  color: string;
  status: "connected" | "disconnected" | "pending";
  docUrl: string;
  authType: string;
  apis: BankAPI[];
}

const BANKS: Bank[] = [
  {
    id: "isbank",
    name: "Türkiye İş Bankası",
    shortName: "İş Bankası",
    logo: "İŞ",
    color: "bg-blue-600",
    status: "connected",
    docUrl: "https://developer.isbank.com.tr",
    authType: "OAuth 2.0 + API Key",
    apis: [
      {
        id: "isbank-accounts",
        name: "Hesap Bilgileri",
        description: "Hesap bakiyesi, IBAN ve hesap hareketlerine erişim (5 API)",
        icon: <Building2 className="h-3.5 w-3.5" />,
        enabled: true,
      },
      {
        id: "isbank-transfer",
        name: "Para Aktarma",
        description: "Havale, EFT ve FAST işlemleri (7 API)",
        icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
        enabled: true,
      },
      {
        id: "isbank-payments",
        name: "Ödemeler",
        description: "Fatura ödeme, POS hizmetleri ve kredi kartı borç ödeme (14 API)",
        icon: <CreditCard className="h-3.5 w-3.5" />,
        enabled: true,
      },
      {
        id: "isbank-cards",
        name: "Kartlar",
        description: "Kredi kartı ve ön ödemeli kart hareketleri (6 API)",
        icon: <CreditCard className="h-3.5 w-3.5" />,
        enabled: false,
      },
      {
        id: "isbank-data",
        name: "Veri Paylaşımı",
        description: "Finansal veri ve raporlama (24 API)",
        icon: <BarChart3 className="h-3.5 w-3.5" />,
        enabled: false,
        beta: true,
      },
      {
        id: "isbank-fx",
        name: "Döviz Kuru",
        description: "TCMB ve İş Bankası kanallarından gerçek zamanlı kur bilgisi",
        icon: <RefreshCw className="h-3.5 w-3.5" />,
        enabled: true,
      },
      {
        id: "isbank-invoices",
        name: "Tedarikçi Finansmanı",
        description: "Fatura iskonto ve tedarikçi ödeme yönetimi",
        icon: <FileText className="h-3.5 w-3.5" />,
        enabled: false,
        beta: true,
      },
    ],
  },
  {
    id: "akbank",
    name: "Akbank T.A.Ş.",
    shortName: "Akbank",
    logo: "AK",
    color: "bg-red-600",
    status: "disconnected",
    docUrl: "https://apiportal.akbank.com",
    authType: "OAuth 2.0 + Client Secret",
    apis: [
      {
        id: "akbank-fx",
        name: "Döviz Kurları",
        description: "Seçilen tarihe ait Akbank döviz kur listesi",
        icon: <RefreshCw className="h-3.5 w-3.5" />,
        enabled: false,
      },
      {
        id: "akbank-credit-rates",
        name: "Kredi Faiz Oranları",
        description: "İhtiyaç, konut ve taşıt kredisi güncel faiz oranları",
        icon: <BarChart3 className="h-3.5 w-3.5" />,
        enabled: false,
      },
      {
        id: "akbank-payment-plan",
        name: "Kredi Ödeme Planı",
        description: "Seçilen kredi faizi ve vadesi için ödeme planı hesaplama",
        icon: <FileText className="h-3.5 w-3.5" />,
        enabled: false,
      },
      {
        id: "akbank-pos",
        name: "VirtualPOS & Cebe POS",
        description: "Sanal POS provizyonları ve Cebe POS işlem durumu",
        icon: <CreditCard className="h-3.5 w-3.5" />,
        enabled: false,
        beta: true,
      },
    ],
  },
  {
    id: "garanti",
    name: "Garanti BBVA",
    shortName: "Garanti",
    logo: "GB",
    color: "bg-emerald-600",
    status: "disconnected",
    docUrl: "https://developer.garantibbva.com.tr",
    authType: "OAuth 2.0",
    apis: [
      {
        id: "garanti-accounts",
        name: "Hesap & Bakiye",
        description: "PSD2 uyumlu hesap bilgisi ve bakiye sorgulama",
        icon: <Building2 className="h-3.5 w-3.5" />,
        enabled: false,
      },
      {
        id: "garanti-payments",
        name: "Ödeme Başlatma",
        description: "PSD2 uyumlu ödeme başlatma hizmetleri",
        icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
        enabled: false,
      },
    ],
  },
  {
    id: "ykb",
    name: "Yapı ve Kredi Bankası",
    shortName: "Yapı Kredi",
    logo: "YK",
    color: "bg-purple-600",
    status: "disconnected",
    docUrl: "https://developer.yapikredi.com.tr",
    authType: "OAuth 2.0",
    apis: [
      {
        id: "ykb-accounts",
        name: "Hesap Hizmetleri",
        description: "Hesap bilgileri ve işlem geçmişi",
        icon: <Building2 className="h-3.5 w-3.5" />,
        enabled: false,
      },
      {
        id: "ykb-payments",
        name: "Ödeme Hizmetleri",
        description: "EFT, FAST ve havale işlemleri",
        icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
        enabled: false,
      },
    ],
  },
];

const STATUS_CONFIG = {
  connected: { label: "Bağlı", className: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  disconnected: { label: "Bağlı Değil", className: "bg-gray-100 text-gray-600 border-gray-200", icon: <Circle className="h-3 w-3" /> },
  pending: { label: "Bekliyor", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
};

function BankCard({ bank: initialBank }: { bank: Bank }) {
  const [bank, setBank] = useState(initialBank);
  const [connecting, setConnecting] = useState(false);
  const [expanded, setExpanded] = useState(bank.status === "connected");

  const toggleAPI = (apiId: string) => {
    if (bank.status !== "connected") return;
    setBank((prev) => ({
      ...prev,
      apis: prev.apis.map((api) =>
        api.id === apiId ? { ...api, enabled: !api.enabled } : api
      ),
    }));
  };

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      toast.info(`${bank.shortName} entegrasyonu için geliştirici portalına yönlendiriliyorsunuz...`);
      window.open(bank.docUrl, "_blank");
    }, 800);
  };

  const handleDisconnect = () => {
    setBank((prev) => ({ ...prev, status: "disconnected" }));
    setExpanded(false);
    toast.success(`${bank.shortName} bağlantısı kesildi.`);
  };

  const statusCfg = STATUS_CONFIG[bank.status];
  const enabledCount = bank.apis.filter((a) => a.enabled).length;

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      bank.status === "connected" ? "border-primary/20 bg-primary/[0.02]" : "border-border"
    )}>
      <div className="flex items-center gap-4 p-4">
        {/* Logo */}
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0", bank.color)}>
          {bank.logo}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold">{bank.name}</p>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border", statusCfg.className)}>
              {statusCfg.icon}
              {statusCfg.label}
            </span>
            {bank.status === "connected" && (
              <span className="text-[10px] text-muted-foreground">
                {enabledCount}/{bank.apis.length} API aktif
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" />
              {bank.authType}
            </span>
            <a
              href={bank.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
            >
              Dokümantasyon
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {bank.status === "connected" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Gizle" : "API'leri Yönet"}
            </Button>
          )}
          {bank.status === "connected" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleDisconnect}
            >
              Bağlantıyı Kes
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
              {connecting ? "Bağlanıyor..." : "Bağlan"}
            </Button>
          )}
        </div>
      </div>

      {/* API List */}
      {expanded && bank.status === "connected" && (
        <div className="border-t mx-4 mb-4 pt-3 space-y-2">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Aktif API'ler</p>
          {bank.apis.map((api) => (
            <div key={api.id} className="flex items-center justify-between rounded-lg hover:bg-muted/40 px-2 py-2 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="text-muted-foreground">{api.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium">{api.name}</p>
                    {api.beta && (
                      <Badge variant="outline" className="text-[9px] h-3.5 px-1 py-0 border-yellow-300 text-yellow-700 bg-yellow-50">BETA</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{api.description}</p>
                </div>
              </div>
              <Switch
                checked={api.enabled}
                onCheckedChange={() => toggleAPI(api.id)}
                className="scale-75"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BankIntegrationsSection() {
  const connectedCount = BANKS.filter((b) => b.status === "connected").length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-medium">Banka Entegrasyonları</h3>
        <p className="text-sm text-muted-foreground">
          Banka API'lerini bağlayın ve finans verilerinizi otomatik senkronize edin.
        </p>
      </div>
      <Separator />

      {/* Özet */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-2xl font-bold">{connectedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Bağlı Banka</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-2xl font-bold">{BANKS.reduce((s, b) => s + b.apis.filter(a => a.enabled).length, 0)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Aktif API</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-2xl font-bold">{BANKS.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Desteklenen Banka</p>
        </div>
      </div>

      {/* Uyarı */}
      <div className="flex gap-2.5 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30 p-3">
        <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-yellow-800 dark:text-yellow-400">Güvenli Bağlantı</p>
          <p className="text-[11px] text-yellow-700 dark:text-yellow-500 mt-0.5">
            Tüm banka bağlantıları OAuth 2.0 ile şifrelenir. API anahtarlarınız sunucularımızda AES-256 ile depolanır. Hiçbir banka şifresi saklanmaz.
          </p>
        </div>
      </div>

      {/* Banka Kartları */}
      <div className="space-y-3">
        {BANKS.map((bank) => (
          <BankCard key={bank.id} bank={bank} />
        ))}
      </div>
    </div>
  );
}