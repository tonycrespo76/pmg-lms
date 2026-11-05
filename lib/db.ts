import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pmgPool?: Pool };

export const db = globalForDb.pmgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
});

if (process.env.NODE_ENV !== "production") globalForDb.pmgPool = db;
