import { getSiteSettings, getPromotion, getProducts } from "@/lib/dal";
import {
  ContactForm,
  PromotionForm,
  AppearanceForm,
  MercadoPagoForm,
  HeroForm,
  ShippingForm,
  EmailForm,
} from "@/components/forms/SettingsForms";
import { WhatsAppPanel } from "@/components/WhatsAppPanel";
import { getShippingConfig } from "@/lib/dal";

function toLocalInput(date: Date | null): string {
  if (!date) return "";
  // format to yyyy-MM-ddThh:mm for <input type="datetime-local">
  const off = date.getTimezoneOffset();
  const local = new Date(date.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export default async function AjustesPage() {
  const [settings, promo, products, shipping] = await Promise.all([
    getSiteSettings(),
    getPromotion(),
    getProducts(),
    getShippingConfig(),
  ]);

  const productOptions = products.map((p) => ({
    id: p.id,
    label: `${p.brand} ${p.model}`,
    image: p.images?.split(",").filter(Boolean)[0] ?? null,
  }));

  const envToken = (process.env.MERCADOPAGO_ACCESS_TOKEN ?? "").trim();
  const mpSource: "env" | "panel" | null = envToken
    ? "env"
    : settings.mpAccessToken?.trim()
      ? "panel"
      : null;

  const envSmtp = (process.env.SMTP_USER ?? "").trim() && (process.env.SMTP_PASS ?? "").trim();
  const mailSource: "env" | "panel" | null = envSmtp
    ? "env"
    : settings.smtpUser?.trim() && settings.smtpPass?.trim()
      ? "panel"
      : null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">Ajustes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Contacto de la tienda y popup promocional.
        </p>
      </div>

      <ContactForm
        defaults={{
          whatsapp: settings.whatsapp,
          whatsappMessage: settings.whatsappMessage,
          instagram: settings.instagram,
          tiktok: settings.tiktok,
          transferAlias: settings.transferAlias,
        }}
      />

      <WhatsAppPanel number={settings.whatsapp} message={settings.whatsappMessage} />

      <HeroForm
        defaults={{
          heroProductId: settings.heroProductId,
          heroImage: settings.heroImage,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          heroBadge: settings.heroBadge,
          heroCtaText: settings.heroCtaText,
          heroCtaLink: settings.heroCtaLink,
        }}
        products={productOptions}
      />

      <ShippingForm
        defaults={{
          shipPackageWeight: settings.shipPackageWeight,
          shipPackageL: settings.shipPackageL,
          shipPackageW: settings.shipPackageW,
          shipPackageH: settings.shipPackageH,
          shipOriginCp: settings.shipOriginCp,
          shipFreeThreshold: settings.shipFreeThreshold,
          shipDefaultRate: settings.shipDefaultRate,
          rates: shipping.rates,
          pickupEnabled: settings.pickupEnabled,
          pickupProvince: settings.pickupProvince,
          pickupNote: settings.pickupNote,
        }}
      />

      <EmailForm
        defaults={{ smtpUser: settings.smtpUser, mailFromName: settings.mailFromName }}
        connected={mailSource !== null}
        source={mailSource}
      />

      <MercadoPagoForm
        defaults={{ mpPublicKey: settings.mpPublicKey }}
        connected={mpSource !== null}
        source={mpSource}
      />

      <AppearanceForm
        defaults={{
          storeBg: settings.storeBg,
          storeAccent: settings.storeAccent,
          storeFont: settings.storeFont,
        }}
      />

      <PromotionForm
        defaults={{
          enabled: promo.enabled,
          title: promo.title,
          message: promo.message,
          couponCode: promo.couponCode,
          ctaText: promo.ctaText,
          ctaLink: promo.ctaLink,
          endsAtLocal: toLocalInput(promo.endsAt),
        }}
      />
    </div>
  );
}
