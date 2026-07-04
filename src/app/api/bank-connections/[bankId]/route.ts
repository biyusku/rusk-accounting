/**
 * /api/bank-connections/[bankId] — DELETE (bağlantıyı kes)
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BankConnection from "@/models/BankConnection";
import { getSession } from "@/lib/auth/session";

interface Params { params: Promise<{ bankId: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { bankId } = await params;
  await connectDB();

  const result = await BankConnection.findOneAndDelete({
    companyId: session.companyId,
    bankId,
  });

  if (!result) return NextResponse.json({ error: "Bağlantı bulunamadı" }, { status: 404 });
  return NextResponse.json({ success: true });
}