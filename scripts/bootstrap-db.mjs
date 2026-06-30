// Se ejecuta al arrancar en producción (antes de migrate/seed).
// Si hay disco persistente (DATA_DIR) y todavía no existe la base ahí,
// copia el snapshot prisma/bootstrap.db como base inicial. Una sola vez.
import { existsSync, copyFileSync, mkdirSync } from "fs";
import path from "path";

const dataDir = process.env.DATA_DIR;
if (!dataDir) {
  console.log("[bootstrap] sin DATA_DIR, nada que hacer (entorno local).");
  process.exit(0);
}

// Aseguramos carpetas del disco persistente.
mkdirSync(dataDir, { recursive: true });
mkdirSync(path.join(dataDir, "uploads", "products"), { recursive: true });

// Destino de la base = lo que indique DATABASE_URL (file:/data/prod.db) o por defecto.
const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(dataDir, "prod.db")}`;
const target = dbUrl.replace(/^file:/, "");

if (existsSync(target)) {
  console.log("[bootstrap] la base ya existe, no se toca:", target);
  process.exit(0);
}

const snapshot = path.resolve("prisma", "bootstrap.db");
if (!existsSync(snapshot)) {
  console.log("[bootstrap] no hay snapshot; migrate/seed crearán la base vacía.");
  process.exit(0);
}

copyFileSync(snapshot, target);
console.log("[bootstrap] base inicial copiada desde snapshot ->", target);
