/** /api/auth/me — oturum bilgisini döner */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  return NextResponse.json({
    userId: session.userId,
    companyId: session.companyId,
    email: session.email,
    name: session.name,
    role: session.role,
  });
}