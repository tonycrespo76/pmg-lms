import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/smtp2go";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email: rawEmail } = await request.json();
    const email = String(rawEmail ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const result = await db.query(
      "SELECT id, email, name, totp_secret FROM pmg_users WHERE email = $1 AND active = true LIMIT 1",
      [email],
    );
    if (!result.rows.length) return NextResponse.json({ error: "No account exists for this email address." }, { status: 404 });

    const user = result.rows[0];
    if (user.totp_secret) {
      await setSession(user, true);
      return NextResponse.json({ requiresTotp: true });
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 12);
    await db.query("UPDATE pmg_email_otps SET consumed_at = NOW() WHERE user_id = $1 AND consumed_at IS NULL", [user.id]);
    await db.query("INSERT INTO pmg_email_otps (user_id, code_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')", [user.id, codeHash]);
    await sendOtpEmail(email, code);

    return NextResponse.json({ message: "Verification code sent.", requiresTotp: false });
  } catch (error) {
    console.error("OTP request failed", error);
    return NextResponse.json({ error: "Unable to send a verification code right now." }, { status: 500 });
  }
}
