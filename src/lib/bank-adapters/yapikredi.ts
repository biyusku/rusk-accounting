/**
 * Yapı Kredi Adapter
 *
 * Gerçek bağlantı için:
 * 1. https://developer.yapikredi.com.tr adresine kayıt ol
 * 2. "Uygulamalarım" → yeni uygulama oluştur
 * 3. API Key al
 * 4. Ayarlar → Banka Entegrasyonları → Yapı Kredi → Bağlan formuna gir
 */
import type { BankAdapter, BankCredentials, BankAccount, BankTransaction } from "./base";

const SANDBOX_BASE = "https://sandbox.developer.yapikredi.com.tr/api";
const PROD_BASE = "https://api.yapikredi.com.tr";

function getBase() {
  return process.env.YKB_ENV === "production" ? PROD_BASE : SANDBOX_BASE;
}

export const YapiKrediAdapter: BankAdapter = {
  bankId: "ykb",
  bankName: "Yapı Kredi",

  async testConnection(credentials) {
    if (!credentials.apiKey) {
      return { success: false, error: "API Key gerekli" };
    }
    try {
      const res = await fetch(`${getBase()}/v1/health`, {
        headers: { "X-API-Key": credentials.apiKey },
      });
      if (res.ok || res.status === 401) {
        return { success: res.ok };
      }
      return { success: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  async getAccounts(credentials) {
    if (!credentials.apiKey) throw new Error("API Key gerekli");
    const res = await fetch(`${getBase()}/v1/accounts`, {
      headers: { "X-API-Key": credentials.apiKey },
    });
    if (!res.ok) throw new Error(`Yapı Kredi hesaplar alınamadı: ${res.status}`);

    const data = (await res.json()) as { data: Array<{
      id: string;
      name: string;
      iban: string;
      availableBalance: number;
      currency: string;
    }> };

    return (data.data ?? []).map((a) => ({
      externalId: a.id,
      name: a.name,
      iban: a.iban,
      balance: a.availableBalance ?? 0,
      currency: (a.currency as "TRY" | "USD" | "EUR") ?? "TRY",
      type: "checking" as const,
      bankName: "Yapı Kredi",
    }));
  },

  async getTransactions(credentials, accountId, days = 30) {
    if (!credentials.apiKey) throw new Error("API Key gerekli");
    const from = new Date();
    from.setDate(from.getDate() - days);

    const res = await fetch(
      `${getBase()}/v1/accounts/${accountId}/transactions?startDate=${from.toISOString().split("T")[0]}`,
      { headers: { "X-API-Key": credentials.apiKey } }
    );
    if (!res.ok) throw new Error(`YKB işlemler alınamadı: ${res.status}`);

    const data = (await res.json()) as { data: Array<{
      id: string;
      transactionDate: string;
      description: string;
      amount: number;
      direction: "IN" | "OUT";
      counterparty: string;
    }> };

    return (data.data ?? []).map((t) => ({
      externalId: t.id,
      date: t.transactionDate?.split("T")[0] ?? "",
      description: t.description,
      amount: Math.abs(t.amount),
      type: t.direction === "IN" ? "credit" : "debit",
      category: "Diğer",
      status: "completed" as const,
      accountId,
      counterparty: t.counterparty ?? "",
      transactionType: "other" as const,
    }));
  },
};