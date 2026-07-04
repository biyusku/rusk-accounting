/**
 * Akbank Adapter
 *
 * Gerçek bağlantı için:
 * 1. https://apiportal.akbank.com adresine kayıt ol
 * 2. "Applications" → "Add New Application" → uygulama oluştur
 * 3. API'leri subscribe et: Accounts, Transactions
 * 4. Consumer Key (API Key) + Consumer Secret al
 * 5. Ayarlar → Banka Entegrasyonları → Akbank → Bağlan formuna gir
 */
import type { BankAdapter, BankCredentials, BankAccount, BankTransaction } from "./base";

const SANDBOX_BASE = "https://sandbox.apigw.akbank.com";
const PROD_BASE = "https://apigw.akbank.com";

function getBase() {
  return process.env.AKBANK_ENV === "production" ? PROD_BASE : SANDBOX_BASE;
}

async function getToken(credentials: BankCredentials): Promise<string> {
  if (credentials.accessToken) return credentials.accessToken;
  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error("Akbank Consumer Key ve Consumer Secret gerekli");
  }

  const encoded = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64");
  const res = await fetch(`${getBase()}/v1/security/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encoded}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Akbank token alınamadı: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export const AkbankAdapter: BankAdapter = {
  bankId: "akbank",
  bankName: "Akbank",

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
    const res = await fetch(`${getBase()}/v1/customer/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Akbank hesaplar alınamadı: ${res.status}`);

    const data = (await res.json()) as { data: Array<{
      id: string;
      name: string;
      iban: string;
      balance: { amount: number };
      currency: string;
      type: string;
    }> };

    return (data.data ?? []).map((a) => ({
      externalId: a.id,
      name: a.name,
      iban: a.iban,
      balance: a.balance?.amount ?? 0,
      currency: (a.currency as "TRY" | "USD" | "EUR") ?? "TRY",
      type: "checking" as const,
      bankName: "Akbank",
    }));
  },

  async getTransactions(credentials, accountId, days = 30) {
    const token = await getToken(credentials);
    const from = new Date();
    from.setDate(from.getDate() - days);

    const res = await fetch(
      `${getBase()}/v1/customer/accounts/${accountId}/transactions?startDate=${from.toISOString().split("T")[0]}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`Akbank işlemler alınamadı: ${res.status}`);

    const data = (await res.json()) as { data: Array<{
      id: string;
      date: string;
      description: string;
      amount: number;
      type: string;
      counterpartyName: string;
    }> };

    return (data.data ?? []).map((t) => ({
      externalId: t.id,
      date: t.date?.split("T")[0] ?? "",
      description: t.description,
      amount: Math.abs(t.amount),
      type: t.amount >= 0 ? "credit" : "debit",
      category: "Diğer",
      status: "completed" as const,
      accountId,
      counterparty: t.counterpartyName ?? "",
      transactionType: "other" as const,
    }));
  },
};