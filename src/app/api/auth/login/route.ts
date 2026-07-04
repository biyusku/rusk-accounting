/** /api/auth/login */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  await connectDB();
  const { email, password } = (await request.json()) as { email: string; password: string };

  if (!email || !password) {
    return NextResponse.json({ error: "E-posta ve şifre gereklidir." }, { status: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return NextResponse.json({ error: "Hatalı e-posta veya şifre." }, { status: 401 });
  }
  if (!user.isActive) {
    return NextResponse.json({ error: "Hesabınız devre dışı bırakılmış." }, { status: 403 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Hatalı e-posta veya şifre." }, { status: 401 });
  }

  const userId = String(user._id);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      sub: userId,
      userId,
      companyId: user.companyId,
      email: user.email,
      name: user.name,
      role: user.role,
    }),
    signRefreshToken(userId, user.tokenVersion),
  ]);

  await setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({
    id: userId,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  });
}