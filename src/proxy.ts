/**
 * Route protection proxy — dashboard sadece giriş yapmış kullanıcılara açık.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

const PUBLIC_PATHS = ["/auth", "/api/auth/login", "/api/auth/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // API route'ları — sadece /api/auth dışındakiler korunsun
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const token = request.cookies.get(ACCESS_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const session = await verifyAccessToken(token);
    if (!session) return NextResponse.json({ error: "Oturum süresi doldu" }, { status: 401 });
    return NextResponse.next();
  }

  // Dashboard ve diğer korunan sayfalar
  if (pathname.startsWith("/dashboard") || pathname === "/") {
    const token = request.cookies.get(ACCESS_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    const session = await verifyAccessToken(token);
    if (!session) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};