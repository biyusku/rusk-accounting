import type { Account, Transaction } from "@/types";

export const STATUS_MAP: Record<Transaction["status"], { label: string; className: string }> = {
  completed: { label: "Tamamlandı", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" },
  pending:   { label: "Bekliyor",   className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" },
  failed:    { label: "Başarısız",  className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400" },
};

export const TYPE_LABELS: Record<Transaction["transactionType"], string> = {
  havale: "Havale",
  eft: "EFT",
  fast: "FAST",
  pos: "POS",
  atm: "ATM",
  other: "Diğer",
};

export const CURRENCY_SYMBOLS: Record<Account["currency"], string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};
