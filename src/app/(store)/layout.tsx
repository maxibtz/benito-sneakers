import type { CSSProperties } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoModal } from "@/components/PromoModal";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getPromotion, getSiteSettings } from "@/lib/dal";

const FONT_MAP: Record<string, string> = {
  moderna: "var(--font-display)",
  clasica: "var(--font-geist-sans)",
  mono: "var(--font-geist-mono)",
};

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [promo, settings] = await Promise.all([getPromotion(), getSiteSettings()]);

  const themeStyle: CSSProperties = {
    ["--color-store-bg" as string]: settings.storeBg,
    ["--color-lilac-vivid" as string]: settings.storeAccent,
    ["--color-lilac" as string]: settings.storeAccent,
    ["--font-display" as string]: FONT_MAP[settings.storeFont] ?? FONT_MAP.moderna,
  };

  return (
    <div
      className="store-bg flex min-h-screen flex-col text-[var(--color-store-ink)]"
      style={themeStyle}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat number={settings.whatsapp} message={settings.whatsappMessage} />
      {promo?.enabled && (
        <PromoModal
          title={promo.title}
          message={promo.message}
          couponCode={promo.couponCode}
          ctaText={promo.ctaText}
          ctaLink={promo.ctaLink}
          endsAt={promo.endsAt ? promo.endsAt.toISOString() : null}
        />
      )}
    </div>
  );
}
