// Genera prisma/bootstrap.db a partir de la base local (dev.db),
// borrando credenciales sensibles. Ese snapshot se sube al repo y se usa
// como base inicial en producción (se copia al disco persistente en el 1er arranque).
import { copyFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "dev.db");
const dest = path.join(root, "prisma", "bootstrap.db");

if (!existsSync(src)) {
  console.error("No se encontró dev.db en", src);
  process.exit(1);
}

copyFileSync(src, dest);

const db = new Database(dest);

// Borramos secretos del snapshot (van por variables de entorno en prod).
const cols = ["mpAccessToken", "mpPublicKey", "smtpUser", "smtpPass"];
const info = db.prepare("PRAGMA table_info(SiteSettings)").all();
const present = new Set(info.map((c) => c.name));
const toClear = cols.filter((c) => present.has(c));
if (toClear.length) {
  const setClause = toClear.map((c) => `"${c}" = ''`).join(", ");
  db.prepare(`UPDATE SiteSettings SET ${setClause}`).run();
}

db.close();
console.log("bootstrap.db generado y limpiado:", dest);
console.log("Columnas de secretos limpiadas:", toClear.join(", ") || "(ninguna)");
