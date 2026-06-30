import path from "path";

/**
 * Rutas de almacenamiento configurables por entorno.
 *
 * En local: todo vive dentro del proyecto (base en prisma/, imágenes en public/).
 * En producción (Railway/Render): se monta un "disco persistente" en DATA_DIR
 * (ej. /data) y ahí van la base y las imágenes, para que NO se borren en cada
 * actualización del código.
 *
 * Variables de entorno:
 *   DATA_DIR     -> carpeta del disco persistente (ej. /data). Si no está, usa el proyecto.
 *   UPLOAD_DIR   -> override manual de la carpeta de imágenes (opcional).
 */

/** Carpeta absoluta donde se guardan las imágenes subidas. */
export function uploadDir(): string {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  if (process.env.DATA_DIR) {
    return path.join(process.env.DATA_DIR, "uploads", "products");
  }
  return path.join(process.cwd(), "public", "uploads", "products");
}

/**
 * ¿Las imágenes se sirven desde el disco persistente (fuera de /public)?
 * En ese caso un route handler las entrega; en local las sirve Next desde /public.
 */
export function uploadsAreExternal(): boolean {
  return Boolean(process.env.UPLOAD_DIR || process.env.DATA_DIR);
}

/** Prefijo URL público de las imágenes subidas. */
export const UPLOADS_URL_PREFIX = "/uploads/products";
