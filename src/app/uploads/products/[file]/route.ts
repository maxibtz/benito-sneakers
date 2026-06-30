import { readFile, stat } from "fs/promises";
import path from "path";
import { uploadDir } from "@/lib/paths";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

/**
 * Sirve las imágenes subidas cuando están en el disco persistente (fuera de /public).
 * En local, Next sirve estas mismas URLs desde /public y este handler queda sin usar.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ file: string }> }
) {
  const { file } = await ctx.params;

  // Anti path traversal: solo el nombre del archivo, sin separadores.
  const name = path.basename(file);
  if (name !== file || name.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(name).toLowerCase();
  const contentType = MIME[ext];
  if (!contentType) return new Response("Not found", { status: 404 });

  // Buscamos primero en el disco persistente (imágenes nuevas) y, si no está,
  // en las imágenes que vienen con el repo (las cargadas antes del deploy).
  const candidates = [
    path.join(uploadDir(), name),
    path.join(process.cwd(), "public", "uploads", "products", name),
  ];

  for (const full of candidates) {
    try {
      await stat(full);
      const data = await readFile(full);
      return new Response(new Uint8Array(data), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // probamos el siguiente candidato
    }
  }

  return new Response("Not found", { status: 404 });
}
