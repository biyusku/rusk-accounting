/** /api/accounts — GET + POST */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";

function normalize(doc: Record<string, unknown>) {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "accounts", "read")) {
    return NextResponse.json({ error: "Bu kaynağa erişim yetkiniz yok." }, { status: 403 });
  }
  await connectDB();
  const accounts = await Account.find({ companyId: session.companyId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(accounts.map(normalize));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "accounts", "write")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }
  await connectDB();
  const body = (await request.json()) as Record<string, unknown>;
  const account = await Account.create({ ...body, companyId: session.companyId, userId: session.userId });
  return NextResponse.json(normalize(account.toObject()), { status: 201 });
}