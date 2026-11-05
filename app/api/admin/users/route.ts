import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await readSession();
  if (!session?.sub) return false;
  const result = await db.query("SELECT role FROM pmg_users WHERE id=$1 AND active=true", [session.sub]);
  return result.rows[0]?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await db.query("SELECT id, email, name, role, active, access_all_modules, created_at FROM pmg_users ORDER BY created_at DESC");
  const assignments = await db.query("SELECT user_id, module_id FROM pmg_user_modules");
  return NextResponse.json(users.rows.map(user => ({
    ...user,
    moduleIds: assignments.rows.filter(row => row.user_id === user.id).map(row => row.module_id),
  })));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  const role = body.role === "admin" ? "admin" : "learner";
  const result = await db.query(
    "INSERT INTO pmg_users (email, name, role, active, access_all_modules) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, name, role, active, access_all_modules",
    [email, name || null, role, body.active !== false, Boolean(body.accessAllModules)],
  );
  const user = result.rows[0];
  await replaceAssignments(user.id, role === "admin" || Boolean(body.accessAllModules) ? [] : body.moduleIds ?? []);
  return NextResponse.json({ ...user, moduleIds: role === "admin" || body.accessAllModules ? [] : body.moduleIds ?? [] }, { status: 201 });
}

async function replaceAssignments(userId: string, moduleIds: string[]) {
  await db.query("DELETE FROM pmg_user_modules WHERE user_id=$1", [userId]);
  for (const moduleId of moduleIds) {
    await db.query("INSERT INTO pmg_user_modules (user_id, module_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [userId, moduleId]);
  }
}
