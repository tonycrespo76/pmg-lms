import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await readSession();
  if (!session?.sub) redirect("/login");
  const result = await db.query("SELECT id, email, name, role FROM pmg_users WHERE id = $1", [session.sub]);
  if (!result.rows.length || result.rows[0].role !== "admin") redirect("/");
  return result.rows[0];
}
