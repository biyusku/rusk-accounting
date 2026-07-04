/** /api/users/[id] — Admin: kullanıcı güncelle / devre dışı bırak */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth/session";

function normalize(doc: Record<string, unknown>) {
  const { _id, passwordHash: _, ...rest } = doc;
  return { id: String(_id), ...rest };
}

interface Params { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Yönetici yetkisi gerekli." }, { status: 403 });

  const { id } = await params;
  await connectDB();

  // Admin kendi rolünü değiştiremez
  if (id === session.userId) {
    return NextResponse.json({ error: "Kendi hesabınızı bu endpoint'ten düzenleyemezsiniz." }, { status: 400 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  // Sadece izin verilen alanlar güncellensin
  const allowed = ["name", "role", "isActive"] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const user = await User.findOneAndUpdate(
    { _id: id, companyId: session.companyId },
    update,
    { new: true, runValidators: true }
  ).lean();

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  return NextResponse.json(normalize(user as Record<string, unknown>));
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Yönetici yetkisi gerekli." }, { status: 403 });

  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOneAndDelete({ _id: id, companyId: session.companyId }).lean();
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  return NextResponse.json({ success: true });
}