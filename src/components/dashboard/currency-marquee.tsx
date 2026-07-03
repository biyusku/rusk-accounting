"use client";

import { useEffect, useState } from "react";
import { Marquee } from "@/components/ui/marquee";
import { US, EU, GB, CH, JP } from "country-flag-icons/react/3x2";
import type { ExchangeRate } from "@/app/api/exchange-rates/route";

const FLAG_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "USD/TRY": US,
  "EUR/TRY": EU,
  "GBP/TRY": GB,
  "CHF/TRY": CH,
  "JPY/TRY": JP,
};

/** TCMB'den çekilen döviz kuru kartı */
function RateCard({ currency, rate }: ExchangeRate): React.JSX.Element {
  const formatted =
    rate >= 100
      ? rate.toLocaleString("tr-TR", { minimumFractionDigits: 2 })
      : rate.toFixed(3);

  const Flag = FLAG_MAP[currency];

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card text-sm">
      {Flag ? <Flag className="w-5 h-auto rounded-sm shrink-0" /> : null}
      <span className="font-medium">{currency}</span>
      <span className="text-muted-foreground">{formatted}</span>
    </div>
  );
}

/** Yükleniyor skeleton */
function SkeletonCard(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card text-sm animate-pulse">
      <div className="w-5 h-3 bg-muted rounded" />
      <div className="w-16 h-4 bg-muted rounded" />
      <div className="w-12 h-4 bg-muted rounded" />
    </div>
  );
}

export function CurrencyMarquee(): React.JSX.Element {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) {
          setRates(data.rates as ExchangeRate[]);
          setDate(data.date as string);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg border bg-card">
      {loading ? (
        <div className="flex gap-3 px-4 py-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <Marquee pauseOnHover className="py-2 [--gap:0.75rem]" repeat={3}>
            {rates.map((rate) => (
              <RateCard key={rate.currency} {...rate} />
            ))}
          </Marquee>
          {date && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 pointer-events-none">
              TCMB · {date}
            </div>
          )}
        </>
      )}
    </div>
  );
}
