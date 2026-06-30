import { mkdirSync } from "fs";
import path from "path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

// Aseguramos que la carpeta de la base exista (ej. el disco persistente /data).
try {
  const filePath = dbUrl.replace(/^file:/, "");
  mkdirSync(path.dirname(filePath), { recursive: true });
} catch {
  // si no se puede crear (build sin permisos), seguimos: en runtime existe
}

const adapter = new PrismaBetterSqlite3({
  url: dbUrl,
});

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
