/**
 * /api/bank-connections/[bankId]/sync
 * Bağlı bankadan hesapları ve son 30 günün işlemlerini çekip DB'ye yazar.
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BankConnection from "@/models/BankConnection";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { getSession } from "@/lib/auth/session";
import { ensureAdaptersRegistered, getAdapter } from "@/lib/bank-adapters";

interface Params { params: Promise<{ bankId: string }> }

export async function POST(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { bankId } = await params;
  await connectDB();
  ensureAdaptersRegistered();

  // Kaydedilmiş credentials'ı al
  const conn = await BankConnection.findOne({ companyId: session.companyId, bankId });
  if (!conn || conn.status !== "connected") {
    return NextResponse.json({ error: "Bu banka bağlı değil" }, { status: 400 });
  }

  const adapter = getAdapter(bankId);
  if (!adapter) return NextResponse.json({ error: "Adapter bulunamadı" }, { status: 400 });

  const credentials = conn.credentials as Record<string, string>;

  try {
    // 1. Hesapları çek
    const bankAccounts = await adapter.getAccounts(credentials);
    let accountsSynced = 0;
    const accountIdMap = new Map<string, string>(); // externalId → DB _id

    for (const ba of bankAccounts) {
      const existing = await Account.findOneAndUpdate(
        { companyId: session.companyId, iban: ba.iban },
        {
          $set: {
            name: ba.name,
            iban: ba.iban,
            balance: ba.balance,
            currency: ba.currency,
            type: ba.type,
            bankName: ba.bankName,
            userId: session.userId,
            companyId: session.companyId,
          },
        },
        { upsert: true, new: true }
      );
      accountIdMap.set(ba.externalId, String(existing._id));
      accountsSynced++;
    }

    // 2. Her hesap için işlemleri çek
    let transactionsSynced = 0;
    for (const ba of bankAccounts) {
      const dbAccountId = accountIdMap.get(ba.externalId);
      if (!dbAccountId) continue;

      const transactions = await adapter.getTransactions(credentials, ba.externalId, 30);

      for (const t of transactions) {
        // externalId ile duplicate kontrolü
        await Transaction.findOneAndUpdate(
          { companyId: session.companyId, "meta.externalId": t.externalId },
          {
            $set: {
              date: t.date,
              description: t.description,
              amount: t.amount,
              type: t.type,
              category: t.category,
              status: t.status,
              accountId: dbAccountId,
              counterparty: t.counterparty,
              transactionType: t.transactionType,
              userId: session.userId,
              companyId: session.companyId,
              "meta.externalId": t.externalId,
              "meta.bankId": bankId,
            },
          },
          { upsert: true }
        );
        transactionsSynced++;
      }
    }

    // 3. Sync durumunu güncelle
    await BankConnection.findByIdAndUpdate(conn._id, {
      lastSyncAt: new Date(),
      lastSyncStatus: "success",
      lastSyncError: null,
    });

    return NextResponse.json({
      success: true,
      accountsSynced,
      transactionsSynced,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    await BankConnection.findByIdAndUpdate(conn._id, {
      lastSyncAt: new Date(),
      lastSyncStatus: "failed",
      lastSyncError: String(err),
    });
    return NextResponse.json({ error: `Sync başarısız: ${String(err)}` }, { status: 500 });
  }
}