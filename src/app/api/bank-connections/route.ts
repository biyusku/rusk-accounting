/**
 * /api/bank-connections — GET (listele) + POST (bağlan/güncelle credentials)
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BankConnection from "@/models/BankConnection";
import { getSession } from "@/lib/auth/session";
import { ensureAdaptersRegistered, getAdapter } from "@/lib/bank-adapters";

function normalize(doc: Record<string, unknown>) {
  const { _id, "credentials": creds, ...rest } = doc;
  // Credentials'ı güvenli olarak maskele — client'a secret gönderme
  const safeCreds = creds && typeof creds === "object"
    ? {
        hasApiKey: !!((creds as Record<string,unknown>).apiKey),
        hasClientId: !!((creds as Record<string,unknown>).clientId),
        hasClientSecret: !!((creds as Record<string,unknown>).clientSecret),
      }
    : {};
  return { id: String(_id), credentials: safeCreds, ...rest };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await connectDB();
  const conns = await BankConnection.find({ companyId: session.companyId }).lean();
  return NextResponse.json(conns.map(normalize));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  await connectDB();
  ensureAdaptersRegistered();

  const body = (await request.json()) as {
    bankId: string;
    bankName: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  };

  const { bankId, bankName, apiKey, clientId, clientSecret } = body;
  if (!bankId) return NextResponse.json({ error: "bankId zorunlu" }, { status: 400 });

  const adapter = getAdapter(bankId);
  if (!adapter) return NextResponse.json({ error: "Bu banka desteklenmiyor" }, { status: 400 });

  // Bağlantıyı test et
  const credentials = { apiKey, clientId, clientSecret };
  const testResult = await adapter.testConnection(credentials);

  if (!testResult.success) {
    return NextResponse.json(
      { error: `Bağlantı testi başarısız: ${testResult.error ?? "Bilinmeyen hata"}` },
      { status: 400 }
    );
  }

  // Kaydet veya güncelle
  const update: Record<string, unknown> = {
    bankName: bankName ?? adapter.bankName,
    status: "connected",
    "credentials.apiKey": apiKey,
    "credentials.clientId": clientId,
    "credentials.clientSecret": clientSecret,
    lastSyncError: null,
  };

  if (testResult.accessToken) {
    update["credentials.accessToken"] = testResult.accessToken;
    update["credentials.tokenExpiresAt"] = new Date(Date.now() + 3600 * 1000);
  }

  const conn = await BankConnection.findOneAndUpdate(
    { companyId: session.companyId, bankId },
    { $set: { ...update, userId: session.userId } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json(normalize(conn as Record<string, unknown>), { status: 201 });
}