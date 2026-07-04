/**
 * Garanti BBVA Adapter
 *
 * Gerçek bağlantı için:
 * 1. https://developer.garantibbva.com.tr adresine kayıt ol
 * 2. Uygulama oluştur, "Open Banking" API'leri seç
 * 3. Client ID + Client Secret al
 * 4. Ayarlar → Banka Entegrasyonları → Garanti → Bağlan formuna gir
 *
 * PSD2 uyumlu OAuth 2.0 Authorization Code veya Client Credentials flow
 */
import type { BankAdapter, BankCredentials, BankAccount, BankTransaction } from "./base";

const SANDBOX_BASE = "https://sandbox.garantibbva.com.tr/api";
const PROD_BASE = "https://api.garantibbva.com.tr";

function getBase() {
  return process.env.GARANTI_ENV === "production" ? PROD_BASE : SANDBOX_BASE;
}

async function getToken(credentials: BankCredentials): Promise<string> {
  if (credentials.accessToken) return credentials.accessToken;
  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error("Garanti BBVA Client ID ve Client Secret gerekli");
  }

  const res = await fetch(`${getBase()}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    }),
  });

  if (!res.ok) throw new Error(`Garanti token alınamadı: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export const GarantiAdapter: BankAdapter = {
  bankId: "garanti",
  bankName: "Garanti BBVA",

  async testConnection(credentials) {
    try {
      const token = await getToken(credentials);
      return { success: true, accessToken: token };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  async getAccounts(credentials) {
    const token = await getToken(credentials);
    const res = await fetch(`${getBase()}/v1/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Garanti hesaplar alınamadı: ${res.status}`);

    const data = (await res.json()) as { accounts: Array<{
      accountId: string;
      accountName: string;
      iban: string;
      balance: number;
      currency: string;
    }> };

    return (data.accounts ?? []).map((a) => ({
      externalId: a.accountId,
      name: a.accountName,
      iban: a.iban,
      balance: a.balance ?? 0,
      currency: (a.currency as "TRY" | "USD" | "EUR") ?? "TRY",
      type: "checking" as const,
      bankName: "Garanti BBVA",
    }));
  },

  async getTransactions(credentials, accountId, days = 30) {
    const token = await getToken(credentials);
    const from = new Date();
    from.setDate(from.getDate() - days);

    const res = await fetch(
      `${getBase()}/v1/accounts/${accountId}/transactions?dateFrom=${from.toISOString().split("T")[0]}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`Garanti işlemler alınamadı: ${res.status}`);

    const data = (await res.json()) as { transactions: Array<{
      transactionId: string;
      valueDate: string;
      remittanceInformation: string;
      amount: { amount: number; currency: string };
      creditDebitIndicator: "CRDT" | "DBIT";
      counterpartyName: string;
    }> };

    return (data.transactions ?? []).map((t) => ({
      externalId: t.transactionId,
      date: t.valueDate?.split("T")[0] ?? "",
      description: t.remittanceInformation,
      amount: Math.abs(t.amount?.amount ?? 0),
      type: t.creditDebitIndicator === "CRDT" ? "credit" : "debit",
      category: "Diğer",
      status: "completed" as const,
      accountId,
      counterparty: t.counterpartyName ?? "",
      transactionType: "other" as const,
    }));
  },
};