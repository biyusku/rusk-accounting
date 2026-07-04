/**
 * API istemci fonksiyonları — tüm fetch işlemleri buradan yapılır.
 */
import type { Account, Transaction, Invoice, Budget } from "@/types";

const BASE = "/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Accounts
export const getAccounts = () => apiFetch<Account[]>("/accounts");
export const createAccount = (data: Omit<Account, "id">) =>
  apiFetch<Account>("/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const updateAccount = (id: string, data: Partial<Account>) =>
  apiFetch<Account>(`/accounts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const deleteAccount = (id: string) =>
  apiFetch<{ success: boolean }>(`/accounts/${id}`, { method: "DELETE" });

// Transactions
export const getTransactions = () => apiFetch<Transaction[]>("/transactions");
export const createTransaction = (data: Omit<Transaction, "id">) =>
  apiFetch<Transaction>("/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const updateTransaction = (id: string, data: Partial<Transaction>) =>
  apiFetch<Transaction>(`/transactions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const deleteTransaction = (id: string) =>
  apiFetch<{ success: boolean }>(`/transactions/${id}`, { method: "DELETE" });

// Invoices
export const getInvoices = () => apiFetch<Invoice[]>("/invoices");
export const createInvoice = (data: Omit<Invoice, "id">) =>
  apiFetch<Invoice>("/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const updateInvoice = (id: string, data: Partial<Invoice>) =>
  apiFetch<Invoice>(`/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const deleteInvoice = (id: string) =>
  apiFetch<{ success: boolean }>(`/invoices/${id}`, { method: "DELETE" });

// Budgets
export const getBudgets = () => apiFetch<Budget[]>("/budgets");
export const createBudget = (data: Omit<Budget, "id">) =>
  apiFetch<Budget>("/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const updateBudget = (id: string, data: Partial<Budget>) =>
  apiFetch<Budget>(`/budgets/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const deleteBudget = (id: string) =>
  apiFetch<{ success: boolean }>(`/budgets/${id}`, { method: "DELETE" });