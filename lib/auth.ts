import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "pmg_session";
const PENDING_COOKIE = "pmg_pending";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(value);
}

export async function createSession(user: { id: string; email: string; name?: string | null }, pending = false) {
  const token = await new SignJWT({ email: user.email, name: user.name ?? null, kind: pending ? "pending" : "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(pending ? "10m" : "7d")
    .sign(secret());

  return { token, cookie: pending ? PENDING_COOKIE : SESSION_COOKIE };
}

export async function readSession(pending = false) {
  const cookie = cookies().get(pending ? PENDING_COOKIE : SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, secret());
    if (payload.kind !== (pending ? "pending" : "session")) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSession(user: { id: string; email: string; name?: string | null }, pending = false) {
  const { token, cookie } = await createSession(user, pending);
  cookies().set(cookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: pending ? 600 : 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookies() {
  cookies().delete(SESSION_COOKIE);
  cookies().delete(PENDING_COOKIE);
}
