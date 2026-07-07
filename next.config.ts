import type { NextConfig } from "next";

const securityHeaders = [
  // Nadie puede meter la tienda dentro de un iframe (anti-clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // El navegador no "adivina" tipos de archivo (anti-sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No filtrar la URL completa a sitios externos.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Fuerza HTTPS por 2 años una vez que el navegador nos vio en HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Bloquea APIs sensibles del navegador que no usamos.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "220mb", // permite subir videos de muestra (hasta ~100MB c/u)
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
