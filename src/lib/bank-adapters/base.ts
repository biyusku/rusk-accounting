/**
 * Banka adapter interface.
 * Her banka bu interface'i implement eder.
 * Gerçek API entegrasyonu için banka developer portalından
 * alınan credentials burada kullanılır.
 */

export interface BankAccount {
  externalId: string;       // Bankadaki hesap ID
  name: string;
  iban: string;
  balance: number;
  currency: "TRY" | "USD" | "EUR";
  type: "checking" | "savings" | "credit";
  bankName: string;
}

export interface BankTransaction {
  externalId: string;       // Bankadaki işlem ID (duplicate koruması için)
  date: string;             // YYYY-MM-DD
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  status: "completed" | "pending";
  accountId: string;        // Bankadaki hesap ID
  counterparty: string;
  transactionType: "havale" | "eft" | "fast" | "pos" | "atm" | "other";
}

export interface BankCredentials {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
}

export interface BankAdapter {
  bankId: string;
  bankName: string;
  /** Credentials'ı test et — başarılıysa accessToken döner */
  testConnection(credentials: BankCredentials): Promise<{ success: boolean; accessToken?: string; error?: string }>;
  /** Hesapları çek */
  getAccounts(credentials: BankCredentials): Promise<BankAccount[]>;
  /** Son N günün işlemlerini çek */
  getTransactions(credentials: BankCredentials, accountId: string, days?: number): Promise<BankTransaction[]>;
}

/** Adapter kaydı */
const ADAPTERS = new Map<string, BankAdapter>();

export function registerAdapter(adapter: BankAdapter) {
  ADAPTERS.set(adapter.bankId, adapter);
}

export function getAdapter(bankId: string): BankAdapter | undefined {
  return ADAPTERS.get(bankId);
}

export function listAdapters(): BankAdapter[] {
  return Array.from(ADAPTERS.values());
}