import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email: rawEmail, code: rawCode } = await request.json();
  const email = String(rawEmail ?? "").trim().toLowerCase();
  const code = String(rawCode ?? "").trim();
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });

  const userResult = await db.query("SELECT * FROM pmg_users WHERE email = $1 AND active = true LIMIT 1", [email]);
  if (!userResult.rows.length) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  const user = userResult.rows[0];

  const otpResult = await db.query(
    "SELECT id, code_hash FROM pmg_email_otps WHERE user_id = $1 AND consumed_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
    [user.id],
  );
  if (!otpResult.rows.length || !(await bcrypt.compare(code, otpResult.rows[0].code_hash))) {
    return NextResponse.json({ error: "The verification code is invalid or expired." }, { status: 401 });
  }

  await db.query("UPDATE pmg_email_otps SET consumed_at = NOW() WHERE id = $1", [otpResult.rows[0].id]);
  if (user.totp_secret) {
    return NextResponse.json({ error: "This account uses an authenticator app instead of email OTP." }, { status: 400 });
  }
  await setSession(user);
  return NextResponse.json({ requiresTotp: false, authenticated: true });
}
