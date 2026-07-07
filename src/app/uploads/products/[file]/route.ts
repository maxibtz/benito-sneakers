import { createReadStream } from "fs";
import { readFile, stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { uploadDir } from "@/lib/paths";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const VIDEO_EXT = new Set([".mp4", ".m4v", ".webm", ".mov"]);

/**
 * Sirve las imágenes y videos subidos. Busca primero en el disco persistente
 * (archivos nuevos) y cae a /public (los que viajan con el repo).
 * Para videos soporta peticiones Range (necesarias para adelantar/retroceder).
 */
export async function GET(
  req: Request,
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

  const candidates = [
    path.join(uploadDir(), name),
    path.join(process.cwd(), "public", "uploads", "products", name),
  ];

  for (const full of candidates) {
    try {
      const info = await stat(full);

      // Videos: streaming con soporte de Range.
      if (VIDEO_EXT.has(ext)) {
        const range = req.headers.get("range");
        const size = info.size;
        let start = 0;
        let end = size - 1;
        let status = 200;

        if (range) {
          const m = /bytes=(\d*)-(\d*)/.exec(range);
          if (m) {
            if (m[1]) start = parseInt(m[1], 10);
            if (m[2]) end = parseInt(m[2], 10);
            if (Number.isNaN(start) || start >= size) start = 0;
            if (Number.isNaN(end) || end >= size) end = size - 1;
            status = 206;
          }
        }

        const stream = createReadStream(full, { start, end });
        const body = Readable.toWeb(stream) as ReadableStream;
        const headers: Record<string, string> = {
          "Content-Type": contentType,
          "Content-Length": String(end - start + 1),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        };
        if (status === 206) {
          headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
        }
        return new Response(body, { status, headers });
      }

      // Imágenes: respuesta completa.
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
