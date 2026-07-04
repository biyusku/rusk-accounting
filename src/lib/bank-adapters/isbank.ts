/**
 * İş Bankası Adapter
 *
 * Gerçek bağlantı için:
 * 1. https://developer.isbank.com.tr adresine giriş yap
 * 2. "Uygulamalar" → "Yeni Uygulama" → uygulama oluştur
 * 3. Sandbox credentials al: Client ID + Client Secret
 * 4. Bu bilgileri Ayarlar → Banka Entegrasyonları → İş Bankası → Bağlan formuna gir
 *
 * OAuth 2.0 flow:
 *   POST https://sandbox-apigateway.isbank.com.tr/auth/oauth2/token
 *   Body: grant_type=client_credentials&client_id=...&client_secret=...
 */
import type { BankAdapter, BankCredentials, BankAccount, BankTransaction } from "./base";

const SANDBOX_BASE = "https://sandbox-apigateway.isbank.com.tr";
const PROD_BASE = "https://apigateway.isbank.com.tr";

function getBase() {
  return process.env.ISBANK_ENV === "production" ? PROD_BASE : SANDBOX_BASE;
}

async function getToken(credentials: BankCredentials): Promise<string> {
  if (credentials.accessToken) return credentials.accessToken;
  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error("İş Bankası Client ID ve Client Secret gerekli");
  }

  const res = await fetch(`${getBase()}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      scope: "accounts transactions",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token alınamadı: ${err}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export const IsBankAdapter: BankAdapter = {
  bankId: "isbank",
  bankName: "Türkiye İş Bankası",

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
    const res = await fetch(`${getBase()}/retail-banking/v1/accounts`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Hesaplar alınamadı: ${res.status}`);
    const data = (await res.json()) as { accounts: Array<{
      accountId: string;
      accountName: string;
      iban: string;
      currentBalance: number;
      currencyCode: string;
      accountType: string;
    }> };

    return data.accounts.map((a) => ({
      externalId: a.accountId,
      name: a.accountName,
      iban: a.iban,
      balance: a.currentBalance,
      currency: (a.currencyCode as "TRY" | "USD" | "EUR") ?? "TRY",
      type: a.accountType?.toLowerCase().includes("credit") ? "credit" : "checking",
      bankName: "Türkiye İş Bankası",
    }));
  },

  async getTransactions(credentials, accountId, days = 30) {
    const token = await getToken(credentials);
    const from = new Date();
    from.setDate(from.getDate() - days);
    const fromStr = from.toISOString().split("T")[0];

    const res = await fetch(
      `${getBase()}/retail-banking/v1/accounts/${accountId}/transactions?startDate=${fromStr}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`İşlemler alınamadı: ${res.status}`);

    const data = (await res.json()) as { transactions: Array<{
      transactionId: string;
      transactionDate: string;
      description: string;
      amount: number;
      transactionType: string;
      status: string;
      counterpartyName: string;
    }> };

    return data.transactions.map((t) => ({
      externalId: t.transactionId,
      date: t.transactionDate?.split("T")[0] ?? "",
      description: t.description,
      amount: Math.abs(t.amount),
      type: t.amount >= 0 ? "credit" : "debit",
      category: "Diğer",
      status: t.status === "COMPLETED" ? "completed" : "pending",
      accountId,
      counterparty: t.counterpartyName ?? "",
      transactionType: t.transactionType?.toLowerCase().includes("fast")
        ? "fast"
        : t.transactionType?.toLowerCase().includes("eft")
        ? "eft"
        : t.transactionType?.toLowerCase().includes("havale")
        ? "havale"
        : "other",
    }));
  },
};