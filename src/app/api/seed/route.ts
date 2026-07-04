/**
 * /api/seed — Mock veriyi oturum açmış kullanıcının şirketine ait olarak yükler.
 * POST metodu ile çağrılır.
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import Invoice from "@/models/Invoice";
import Budget from "@/models/Budget";
import { getSession } from "@/lib/auth/session";
import {
  mockAccounts,
  mockTransactions,
  mockInvoices,
  mockBudgets,
} from "@/lib/mock-data";

async function runSeed(userId: string, companyId: string) {
  await connectDB();

  const accountCount = await Account.countDocuments({ companyId });
  if (accountCount > 0) {
    return { skipped: true, message: "Bu şirket için veri zaten mevcut, seed atlandı." };
  }

  const accounts = mockAccounts.map(({ id: _, ...rest }) => ({ ...rest, userId, companyId }));
  const transactions = mockTransactions.map(({ id: _, ...rest }) => ({ ...rest, userId, companyId }));
  const invoices = mockInvoices.map(({ id: _, ...rest }) => ({ ...rest, userId, companyId }));
  const budgets = mockBudgets.map(({ id: _, ...rest }) => ({ ...rest, userId, companyId }));

  await Account.insertMany(accounts);
  await Transaction.insertMany(transactions);
  await Invoice.insertMany(invoices);
  await Budget.insertMany(budgets);

  return {
    skipped: false,
    message: "Seed tamamlandı.",
    counts: {
      accounts: accounts.length,
      transactions: transactions.length,
      invoices: invoices.length,
      budgets: budgets.length,
    },
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Önce giriş yapın." }, { status: 401 });
  const result = await runSeed(session.userId, session.companyId);
  return NextResponse.json({ companyId: session.companyId, ...result });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Önce giriş yapın." }, { status: 401 });
  const result = await runSeed(session.userId, session.companyId);
  return NextResponse.json({ companyId: session.companyId, ...result });
}