import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const SITE_DESCRIPTION =
  "Zapatillas alternativas, perfumes árabes originales y ropa. Selección personal, asesoramiento por WhatsApp y envíos a todo el país.";

export const metadata: Metadata = {
  // Base para que las imágenes de la vista previa salgan con URL completa.
  metadataBase: new URL(process.env.APP_URL || "https://benitosneakers.shop"),
  title: "Benito Sneakers — Zapatillas alternativas, perfumes árabes originales y ropa",
  description: SITE_DESCRIPTION,
  // Vista previa al compartir un link (WhatsApp, Instagram, Facebook).
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Benito Sneakers",
    title: "Benito Sneakers",
    description: SITE_DESCRIPTION,
    images: [{ url: "/brand/logo-card.png", width: 1200, height: 544, alt: "Benito Sneakers" }],
  },
  twitter: { card: "summary_large_image" },
  other: {
    // Verificación del dominio benitosneakers.shop en Meta Business.
    "facebook-domain-verification": "5msfrz7umteicubawe4yiz7xu6se2o",
  },
};

// Toda la app se renderiza en el momento (no se pre-genera en el build).
// Necesario porque la base de datos vive en el disco persistente, que en el
// build todavía no está montado. Evita el error "directory does not exist".
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
