import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

async function isAdmin() {
  const session = await readSession();
  if (!session?.sub) return false;
  const result = await db.query("SELECT role FROM pmg_users WHERE id = $1", [session.sub]);
  return result.rows[0]?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const result = await db.query("SELECT * FROM pmg_modules ORDER BY position ASC, created_at ASC");
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  const slug = String(body.slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const result = await db.query(
    `INSERT INTO pmg_modules (slug, title, category, description, transcript, audio_url, duration_minutes, position, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [slug, title, String(body.category ?? "General").trim(), String(body.description ?? ""), String(body.transcript ?? ""),
      String(body.audioUrl ?? ""), Number(body.durationMinutes || 18), Number(body.position || 0), Boolean(body.published)],
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
