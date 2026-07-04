/** /api/auth/register — İlk kullanıcı admin olur, şirket oluşturur */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);
}

export async function POST(request: Request) {
  await connectDB();
  const { email, password, name, companyName } = (await request.json()) as {
    email: string;
    password: string;
    name: string;
    companyName: string;
  };

  if (!email || !password || !name || !companyName) {
    return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalıdır." }, { status: 400 });
  }

  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kullanımda." }, { status: 409 });
  }

  // Şirket oluştur
  const baseSlug = slugify(companyName);
  let slug = baseSlug;
  let suffix = 1;
  while (await Company.exists({ slug })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const company = await Company.create({ name: companyName, slug, adminUserId: "pending" });
  const companyId = String(company._id);

  // Admin kullanıcı oluştur
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    companyId,
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: "admin",
    isActive: true,
  });

  const userId = String(user._id);

  // Şirketin adminUserId'sini güncelle
  await Company.findByIdAndUpdate(companyId, { adminUserId: userId });

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: userId, userId, companyId, email: user.email, name: user.name, role: user.role }),
    signRefreshToken(userId, 0),
  ]);

  await setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({
    id: userId,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId,
    companyName,
  }, { status: 201 });
}