import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export async function GET() {
  const session = await readSession();
  if (!session?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await db.query("SELECT name, email, role, totp_secret FROM pmg_users WHERE id=$1 AND active=true", [session.sub]);
  if (!result.rows.length) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  const user = result.rows[0];
  return NextResponse.json({ name: user.name, email: user.email, role: user.role, totpEnabled: Boolean(user.totp_secret) });
}

export async function DELETE() {
  const session = await readSession();
  if (!session?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.query("UPDATE pmg_users SET totp_secret=NULL, pending_totp_secret=NULL WHERE id=$1", [session.sub]);
  return NextResponse.json({ totpEnabled: false });
}
