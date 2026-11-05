import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await readSession();
  if (!session?.sub) return false;
  const result = await db.query("SELECT role FROM pmg_users WHERE id=$1 AND active=true", [session.sub]);
  return result.rows[0]?.role === "admin";
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const role = body.role === "admin" ? "admin" : "learner";
  const result = await db.query(
    "UPDATE pmg_users SET name=$1, role=$2, active=$3, access_all_modules=$4, updated_at=NOW() WHERE id=$5 RETURNING id, email, name, role, active, access_all_modules",
    [String(body.name ?? "").trim() || null, role, body.active !== false, Boolean(body.accessAllModules), params.id],
  );
  if (!result.rows.length) return NextResponse.json({ error: "User not found." }, { status: 404 });
  await db.query("DELETE FROM pmg_user_modules WHERE user_id=$1", [params.id]);
  if (role !== "admin" && !body.accessAllModules) {
    for (const moduleId of body.moduleIds ?? []) {
      await db.query("INSERT INTO pmg_user_modules (user_id, module_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [params.id, moduleId]);
    }
  }
  return NextResponse.json({ ...result.rows[0], moduleIds: body.moduleIds ?? [] });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await readSession();
  if (params.id === session?.sub) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  const result = await db.query("DELETE FROM pmg_users WHERE id=$1 RETURNING id", [params.id]);
  if (!result.rows.length) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
