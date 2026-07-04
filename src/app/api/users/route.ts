/** /api/users — Admin: tüm şirket kullanıcılarını listele + yeni kullanıcı davet et */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

function normalize(doc: Record<string, unknown>) {
  const { _id, passwordHash: _, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });

  await connectDB();
  const users = await User.find({ companyId: session.companyId }).lean();
  return NextResponse.json(users.map(normalize));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });

  await connectDB();
  const { email, name, password, role } = (await request.json()) as {
    email: string;
    name: string;
    password: string;
    role: string;
  };

  if (!email || !name || !password || !role) {
    return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalıdır." }, { status: 400 });
  }

  const validRoles = ["admin", "manager", "accountant", "viewer"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Geçersiz rol." }, { status: 400 });
  }

  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kullanımda." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    companyId: session.companyId,
    email: email.toLowerCase(),
    passwordHash,
    name,
    role,
    isActive: true,
    invitedBy: session.userId,
  });

  const { passwordHash: __, ...userObj } = user.toObject() as Record<string, unknown>;
  const { _id, ...rest } = userObj;
  return NextResponse.json({ id: String(_id), ...rest }, { status: 201 });
}