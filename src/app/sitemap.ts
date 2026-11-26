import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = (process.env.APP_URL || "https://benitosneakers.shop").replace(/\/$/, "");

// Se genera en cada pedido (la base vive en el disco del servidor, no en el build).
export const dynamic = "force-dynamic";

/** Mapa del sitio para Google: home, productos activos y páginas legales. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    where: { active: true },
    select: { id: true, updatedAt: true },
  });

  return [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    ...products.map((p) => ({
      url: `${BASE}/producto/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${BASE}/legales/cambios-y-devoluciones`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/legales/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/legales/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/arrepentimiento`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
