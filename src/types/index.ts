export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit";
  iban: string;
  balance: number;
  currency: "TRY" | "USD" | "EUR";
  bankName: string;
  cardNumber?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  status: "completed" | "pending" | "failed";
  accountId: string;
  counterparty: string;
  transactionType: "havale" | "eft" | "fast" | "pos" | "atm" | "other";
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  items: InvoiceItem[];
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: "monthly" | "yearly";
  color: string;
  icon: string;
}

export interface KPIData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingInvoices: number;
  pendingInvoicesAmount: number;
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
  pendingChange: number;
}

export interface ExchangeRate {
  currency: string;
  flag: string;
  rate: number;
  change: number;
}

export interface CashFlowData {
  month: string;
  gelir: number;
  gider: number;
}

export interface TransferFormData {
  fromAccountId: string;
  toIban: string;
  amount: string;
  description: string;
  transferType: "havale" | "eft" | "fast";
}