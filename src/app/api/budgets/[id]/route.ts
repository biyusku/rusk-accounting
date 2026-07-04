/** /api/budgets/[id] */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";
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
  if (!hasPermission(session.role, "budgets", "read")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  const { id } = await params;
  await connectDB();
  const b = await Budget.findOne({ _id: id, companyId: session.companyId }).lean();
  if (!b) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(normalize(b as Record<string, unknown>));
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "budgets", "write")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  const { id } = await params;
  await connectDB();
  const body = (await request.json()) as Record<string, unknown>;
  const b = await Budget.findOneAndUpdate(
    { _id: id, companyId: session.companyId }, body, { new: true, runValidators: true }
  ).lean();
  if (!b) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(normalize(b as Record<string, unknown>));
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "budgets", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  const { id } = await params;
  await connectDB();
  const b = await Budget.findOneAndDelete({ _id: id, companyId: session.companyId }).lean();
  if (!b) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ success: true });
}