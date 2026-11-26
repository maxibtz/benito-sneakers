import type { MetadataRoute } from "next";

const BASE = (process.env.APP_URL || "https://benitosneakers.shop").replace(/\/$/, "");

// Se arma en el servidor para usar siempre la dirección real de la tienda.
export const dynamic = "force-dynamic";

/** Indicaciones para buscadores: la tienda sí, el panel y las cuentas no. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cuenta", "/checkout", "/carrito", "/pedido-confirmado", "/restablecer"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
