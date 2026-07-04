/**
 * JWT access ve refresh token işlemleri.
 */
import { SignJWT, jwtVerify } from "jose";

const ACCESS_EXPIRY = "4h";
const REFRESH_EXPIRY = "7d";

export interface JwtPayload {
  sub: string;
  userId: string;
  companyId: string;
  email: string;
  name: string | null;
  role: "admin" | "manager" | "accountant" | "viewer";
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

function encode(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

function getAccessSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET tanımlı değil");
  return encode(s);
}

function getRefreshSecret(): Uint8Array {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error("JWT_REFRESH_SECRET tanımlı değil");
  return encode(s);
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
    companyId: payload.companyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(getAccessSecret());
}

export async function signRefreshToken(userId: string, tokenVersion: number): Promise<string> {
  return new SignJWT({ v: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return {
      sub: payload.sub as string,
      userId: payload.sub as string,
      companyId: (payload["companyId"] as string) ?? "",
      email: payload["email"] as string,
      name: (payload["name"] as string | null) ?? null,
      role: (payload["role"] as "admin" | "manager" | "accountant" | "viewer") ?? "viewer",
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return {
      userId: payload.sub as string,
      tokenVersion: (payload["v"] as number) ?? 0,
    };
  } catch {
    return null;
  }
}