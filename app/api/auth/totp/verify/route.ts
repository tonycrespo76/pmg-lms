import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { db } from "@/lib/db";
import { readSession, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await readSession() ?? await readSession(true);
  if (!session?.sub) return NextResponse.json({ error: "Sign-in expired. Please request a new code." }, { status: 401 });
  const body = await request.json();
  const { code } = body;
  const result = await db.query("SELECT id, email, name, totp_secret, pending_totp_secret FROM pmg_users WHERE id = $1", [session.sub]);
  if (!result.rows.length) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  const user = result.rows[0];
  const setup = Boolean(body.setup || user.pending_totp_secret);
  const secret = setup ? user.pending_totp_secret : user.totp_secret;
  if (!secret || !speakeasy.totp.verify({ secret, encoding: "base32", token: String(code ?? ""), window: 1 })) {
    return NextResponse.json({ error: "The authenticator code is invalid." }, { status: 401 });
  }
  if (setup) {
    await db.query("UPDATE pmg_users SET totp_secret = $1, pending_totp_secret = NULL WHERE id = $2", [secret, user.id]);
  }
  await setSession(user);
  return NextResponse.json({ authenticated: true });
}
