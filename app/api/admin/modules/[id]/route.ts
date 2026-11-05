import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

async function isAdmin() {
  const session = await readSession();
  if (!session?.sub) return false;
  const result = await db.query("SELECT role FROM pmg_users WHERE id = $1", [session.sub]);
  return result.rows[0]?.role === "admin";
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const result = await db.query(
    `UPDATE pmg_modules SET title=$1, slug=$2, category=$3, description=$4, transcript=$5, audio_url=$6,
     duration_minutes=$7, position=$8, published=$9, language=$11, updated_at=NOW() WHERE id=$10 RETURNING *`,
    [body.title, body.slug, body.category, body.description, body.transcript, body.audioUrl,
      Number(body.durationMinutes), Number(body.position), Boolean(body.published), params.id,
      body.language === "es" ? "es" : "en"],
  );
  if (!result.rows.length) return NextResponse.json({ error: "Module not found." }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const result = await db.query("DELETE FROM pmg_modules WHERE id=$1 RETURNING id", [params.id]);
  if (!result.rows.length) return NextResponse.json({ error: "Module not found." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
