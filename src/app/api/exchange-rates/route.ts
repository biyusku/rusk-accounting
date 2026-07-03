import { NextResponse } from "next/server";

/** TCMB kurlarını Turkpidya üzerinden çeker. */

const TURKPIDYA_FX_URL = "https://turkpidya.com/wp-json/turkpidya-data/v1/fx";
const CACHE_SECONDS = 3600; // TCMB günde bir günceller

const WANTED = ["USD", "EUR", "GBP", "CHF", "JPY"] as const;

const FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  CHF: "🇨🇭",
  JPY: "🇯🇵",
};

interface TcmbRate {
  code: string;
  forex_buying: number;
  forex_selling: number;
  cross_rate_usd: number;
}

interface TurkpidyaResponse {
  rates: TcmbRate[];
  rate_date: string;
}

export interface ExchangeRate {
  currency: string;
  flag: string;
  rate: number;
  change: number;
  date: string;
}

export async function GET() {
  try {
    const res = await fetch(TURKPIDYA_FX_URL, {
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream API error" }, { status: 502 });
    }

    const data = (await res.json()) as TurkpidyaResponse;

    const rates: ExchangeRate[] = WANTED.map((code) => {
      const found = data.rates.find((r) => r.code === code);
      return {
        currency: `${code}/TRY`,
        flag: FLAGS[code] ?? "🏳️",
        rate: found?.forex_selling ?? 0,
        change: 0, // TCMB değişim verisi sunmuyor, 0 bırakıyoruz
        date: data.rate_date,
      };
    });

    return NextResponse.json({ rates, date: data.rate_date });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}