import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { uploadDir, UPLOADS_URL_PREFIX } from "@/lib/paths";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB por imagen

const ALLOWED_VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB por video

/** Valida que el archivo sea una imagen permitida y dentro del tamaño. Devuelve la extensión segura. */
function safeImageExt(file: File): string | null {
  if (!file.type.startsWith("image/")) return null;
  if (file.size > MAX_BYTES) return null;
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return null;
  return ext;
}

/** Valida que el archivo sea un video permitido y dentro del tamaño. Devuelve la extensión segura. */
function safeVideoExt(file: File): string | null {
  if (!file.type.startsWith("video/")) return null;
  if (file.size > MAX_VIDEO_BYTES) return null;
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_VIDEO_EXT.has(ext)) return null;
  return ext;
}

async function persist(file: File, filename: string): Promise<string> {
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `${UPLOADS_URL_PREFIX}/${filename}`;
}

/** Guarda videos de muestra de un producto. Devuelve las URLs guardadas. */
export async function saveProductVideos(files: File[], sku: string): Promise<string[]> {
  const saved: string[] = [];
  const safeSku = sku.replace(/[^a-zA-Z0-9-_]/g, "");
  let i = 0;
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    const ext = safeVideoExt(file);
    if (!ext) continue;
    saved.push(await persist(file, `${safeSku}-video-${Date.now()}-${i++}${ext}`));
  }
  return saved;
}

/**
 * Guarda la foto o video de un testimonio (unboxing, "llegó la mercadería").
 * Devuelve { url, type } o null si el archivo no es válido.
 */
export async function saveTestimonialMedia(
  file: File | null
): Promise<{ url: string; type: "image" | "video" } | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  const imgExt = safeImageExt(file);
  if (imgExt) {
    return { url: await persist(file, `testi-${Date.now()}${imgExt}`), type: "image" };
  }
  const vidExt = safeVideoExt(file);
  if (vidExt) {
    return { url: await persist(file, `testi-${Date.now()}${vidExt}`), type: "video" };
  }
  return null;
}

export async function saveBannerImage(file: File | null): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  const ext = safeImageExt(file);
  if (!ext) return null;
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const filename = `banner-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `${UPLOADS_URL_PREFIX}/${filename}`;
}

export async function saveProductImages(files: File[], sku: string): Promise<string[]> {
  const validFiles = files.filter((f) => f instanceof File && f.size > 0);
  if (validFiles.length === 0) return [];

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });

  const savedPaths: string[] = [];
  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];
    const ext = safeImageExt(file);
    if (!ext) continue; // ignoramos archivos que no sean imágenes válidas
    const safeSku = sku.replace(/[^a-zA-Z0-9-_]/g, "");
    const filename = `${safeSku}-${Date.now()}-${i}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
    savedPaths.push(`${UPLOADS_URL_PREFIX}/${filename}`);
  }
  return savedPaths;
}
