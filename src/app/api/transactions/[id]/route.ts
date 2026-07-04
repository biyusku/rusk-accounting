/** /api/transactions/[id] */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";

function normalize(doc: Record<string, unknown>) {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "transactions", "read")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  const { id } = await params;
  await connectDB();
  const t = await Transaction.findOne({ _id: id, companyId: session.companyId }).lean();
  if (!t) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(normalize(t as Record<string, unknown>));
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "transactions", "write")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  const { id } = await params;
  await connectDB();
  const body = (await request.json()) as Record<string, unknown>;
  const t = await Transaction.findOneAndUpdate(
    { _id: id, companyId: session.companyId }, body, { new: true, runValidators: true }
  ).lean();
  if (!t) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(normalize(t as Record<string, unknown>));
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "transactions", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  const { id } = await params;
  await connectDB();
  const t = await Transaction.findOneAndDelete({ _id: id, companyId: session.companyId }).lean();
  if (!t) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ success: true });
}