/** /api/transactions — GET + POST */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";

function normalize(doc: Record<string, unknown>) {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "transactions", "read")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  await connectDB();
  const transactions = await Transaction.find({ companyId: session.companyId }).sort({ date: -1, createdAt: -1 }).lean();
  return NextResponse.json(transactions.map(normalize));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "transactions", "write")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  await connectDB();
  const body = (await request.json()) as Record<string, unknown>;
  const transaction = await Transaction.create({ ...body, companyId: session.companyId, userId: session.userId });
  return NextResponse.json(normalize(transaction.toObject()), { status: 201 });
}