import { NextResponse } from "next/server";
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export async function POST() {
  const pending = await readSession(true);
  if (!pending?.sub) return NextResponse.json({ error: "Sign-in expired. Please request a new code." }, { status: 401 });
  const secret = speakeasy.generateSecret({ name: "PMG Learning", issuer: "PMG Learning" });
  await db.query("UPDATE pmg_users SET pending_totp_secret = $1 WHERE id = $2", [secret.base32, pending.sub]);
  return NextResponse.json({ secret: secret.base32, qrCode: await QRCode.toDataURL(secret.otpauth_url!) });
}
