/** /api/invoices — GET + POST */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";

function normalize(doc: Record<string, unknown>) {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "invoices", "read")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  await connectDB();
  const invoices = await Invoice.find({ companyId: session.companyId }).sort({ issueDate: -1 }).lean();
  return NextResponse.json(invoices.map(normalize));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(session.role, "invoices", "write")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  await connectDB();
  const body = (await request.json()) as Record<string, unknown>;
  const invoice = await Invoice.create({ ...body, companyId: session.companyId, userId: session.userId });
  return NextResponse.json(normalize(invoice.toObject()), { status: 201 });
}