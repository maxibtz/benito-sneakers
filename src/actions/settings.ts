"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveBannerImage, saveProductImages, saveTestimonialMedia } from "@/lib/uploads";
import { forceRefreshUsdRate } from "@/lib/usd-rate";

export type SettingsState = { ok?: boolean; error?: string };

export async function updateContactAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const whatsappMessage = String(formData.get("whatsappMessage") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim().replace(/^@/, "");
  const tiktok = String(formData.get("tiktok") ?? "").trim().replace(/^@/, "");
  const transferAlias = String(formData.get("transferAlias") ?? "").trim();
  const metaPixelId = String(formData.get("metaPixelId") ?? "").replace(/D/g, "");
  if (metaPixelId && (metaPixelId.length < 10 || metaPixelId.length > 20)) {
    return { error: "El ID del Píxel de Meta tiene que ser un número de 15 o 16 dígitos." };
  }

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: { whatsapp, whatsappMessage, instagram, tiktok, transferAlias, metaPixelId },
    create: { id: "default", whatsapp, whatsappMessage, instagram, tiktok, transferAlias, metaPixelId },
  });

  revalidatePath("/admin/ajustes");
  revalidatePath("/", "layout");
  return { ok: true };
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const FONTS = ["moderna", "clasica", "mono"];

export async function updateAppearanceAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const storeBg = String(formData.get("storeBg") ?? "").trim();
  const storeAccent = String(formData.get("storeAccent") ?? "").trim();
  const storeFont = String(formData.get("storeFont") ?? "moderna").trim();

  if (!HEX.test(storeBg) || !HEX.test(storeAccent)) {
    return { error: "Los colores deben estar en formato hex (#RRGGBB)." };
  }
  if (!FONTS.includes(storeFont)) {
    return { error: "Tipografía inválida." };
  }

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: { storeBg, storeAccent, storeFont },
    create: { id: "default", storeBg, storeAccent, storeFont },
  });

  revalidatePath("/admin/ajustes");
  revalidatePath("/", "layout");
  return { ok: true };
}

function cleanJsonArray(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string") return "[]";
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return "[]";
    return JSON.stringify(parsed);
  } catch {
    return "[]";
  }
}

/**
 * Suma a cada testimonio la foto/video subida (input testimonialMedia_{i}).
 * El JSON ya trae media/mediaType existentes si no se cambió nada.
 */
async function mergeTestimonialMedia(
  testimonialsJson: string,
  formData: FormData
): Promise<string> {
  try {
    const items = JSON.parse(testimonialsJson);
    if (!Array.isArray(items)) return testimonialsJson;
    for (let i = 0; i < items.length; i++) {
      const file = formData.get(`testimonialMedia_${i}`);
      const saved = await saveTestimonialMedia(file instanceof File ? file : null);
      if (saved) {
        items[i].media = saved.url;
        items[i].mediaType = saved.type;
      }
    }
    return JSON.stringify(items);
  } catch {
    return testimonialsJson;
  }
}

export async function updateHomeContentAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const bool = (k: string) => formData.get(k) === "on";

  // UGC: imágenes existentes (tras posibles eliminaciones) + nuevas subidas.
  const existingUgc = str("ugcImages")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ugcFiles = (formData.getAll("ugcFiles") as File[]).filter((f) => f.size > 0);
  const newUgc = await saveProductImages(ugcFiles, "ugc");
  const ugcImages = [...existingUgc, ...newUgc].join(",");

  const data = {
    showBenefits: bool("showBenefits"),
    showFeatured: bool("showFeatured"),
    showProblemSol: bool("showProblemSol"),
    showTestimonials: bool("showTestimonials"),
    showCategories: bool("showCategories"),
    showDifferentials: bool("showDifferentials"),
    showUgc: bool("showUgc"),
    showFaq: bool("showFaq"),
    showFinalCta: bool("showFinalCta"),

    benefitsTitle: str("benefitsTitle"),
    benefits: cleanJsonArray(formData.get("benefits")),

    featuredTitle: str("featuredTitle"),
    featuredSubtitle: str("featuredSubtitle"),

    psTitle: str("psTitle"),
    psSubtitle: str("psSubtitle"),
    psItems: cleanJsonArray(formData.get("psItems")),

    testimonialsTitle: str("testimonialsTitle"),
    testimonialsSubtitle: str("testimonialsSubtitle"),
    testimonials: await mergeTestimonialMedia(
      cleanJsonArray(formData.get("testimonials")),
      formData
    ),

    categoriesTitle: str("categoriesTitle"),
    categoriesSubtitle: str("categoriesSubtitle"),
    categories: cleanJsonArray(formData.get("categories")),

    differentialsTitle: str("differentialsTitle"),
    differentialsSubtitle: str("differentialsSubtitle"),
    differentials: cleanJsonArray(formData.get("differentials")),

    ugcTitle: str("ugcTitle"),
    ugcSubtitle: str("ugcSubtitle"),
    ugcImages,

    faqTitle: str("faqTitle"),
    faqSubtitle: str("faqSubtitle"),
    faqs: cleanJsonArray(formData.get("faqs")),

    finalCtaTitle: str("finalCtaTitle"),
    finalCtaText: str("finalCtaText"),
    finalCtaButton: str("finalCtaButton"),
    finalCtaLink: str("finalCtaLink"),
  };

  await db.homeContent.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateHeroAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const heroProductId = String(formData.get("heroProductId") ?? "").trim();
  const heroTitle = String(formData.get("heroTitle") ?? "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") ?? "").trim();
  const heroBadge = String(formData.get("heroBadge") ?? "").trim();
  const heroCtaText = String(formData.get("heroCtaText") ?? "").trim();
  const heroCtaLink = String(formData.get("heroCtaLink") ?? "").trim();
  const removeBanner = formData.get("removeBanner") === "on";

  const bannerFile = formData.get("heroImage") as File | null;
  const uploaded = await saveBannerImage(bannerFile);

  // El banner subido tiene prioridad; si tildan "quitar", lo borramos.
  const heroImageData =
    uploaded != null
      ? { heroImage: uploaded }
      : removeBanner
        ? { heroImage: "" }
        : {};

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: { heroProductId, heroTitle, heroSubtitle, heroBadge, heroCtaText, heroCtaLink, ...heroImageData },
    create: {
      id: "default",
      heroProductId,
      heroTitle,
      heroSubtitle,
      heroBadge,
      heroCtaText,
      heroCtaLink,
      heroImage: uploaded ?? "",
    },
  });

  revalidatePath("/admin/ajustes");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateEmailAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const smtpUser = String(formData.get("smtpUser") ?? "").trim();
  const smtpPass = String(formData.get("smtpPass") ?? "").replace(/\s+/g, ""); // las app passwords vienen con espacios
  const mailFromName = String(formData.get("mailFromName") ?? "Benito Sneakers").trim();

  if (smtpUser && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(smtpUser)) {
    return { error: "Poné un email válido (ej: benito.fsa4@gmail.com)." };
  }

  // Si la contraseña viene vacía, mantenemos la que ya estaba.
  const passData = smtpPass ? { smtpPass } : {};

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: { smtpUser, mailFromName, ...passData },
    create: { id: "default", smtpUser, smtpPass, mailFromName },
  });

  revalidatePath("/admin/ajustes");
  return { ok: true };
}

/** Botón "Actualizar ahora" en Ajustes — fuerza la consulta de la cotización. */
export async function refreshUsdRateAction() {
  await requireAdmin();
  await forceRefreshUsdRate();
  revalidatePath("/admin/ajustes");
  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}

export async function updateShippingAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const num = (k: string, def = 0) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) && v >= 0 ? v : def;
  };

  // Tarifas por provincia: inputs nombrados rate__<provincia>
  const rates: Record<string, number> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("rate__")) {
      const province = key.slice("rate__".length);
      const cost = Number(value);
      if (Number.isFinite(cost) && cost > 0) rates[province] = cost;
    }
  }

  const data = {
    shipPackageWeight: num("shipPackageWeight", 1),
    shipPackageL: Math.round(num("shipPackageL", 30)),
    shipPackageW: Math.round(num("shipPackageW", 20)),
    shipPackageH: Math.round(num("shipPackageH", 15)),
    shipOriginCp: String(formData.get("shipOriginCp") ?? "").trim(),
    shipFreeThreshold: num("shipFreeThreshold", 0),
    shipDefaultRate: num("shipDefaultRate", 0),
    shipRates: JSON.stringify(rates),
    pickupEnabled: formData.get("pickupEnabled") === "on",
    pickupProvince: String(formData.get("pickupProvince") ?? "Formosa").trim(),
    pickupNote: String(formData.get("pickupNote") ?? "").trim(),
  };

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  revalidatePath("/admin/ajustes");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateMercadoPagoAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const mpAccessToken = String(formData.get("mpAccessToken") ?? "").trim();
  const mpPublicKey = String(formData.get("mpPublicKey") ?? "").trim();

  if (mpAccessToken && !/^(APP_USR|TEST)-/.test(mpAccessToken)) {
    return {
      error:
        "El Access Token no parece válido. Tiene que empezar con APP_USR- (producción) o TEST- (prueba).",
    };
  }

  // Si el Access Token viene vacío, mantenemos el que ya estaba guardado.
  const tokenData = mpAccessToken ? { mpAccessToken } : {};

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: { ...tokenData, mpPublicKey },
    create: { id: "default", mpAccessToken, mpPublicKey },
  });

  revalidatePath("/admin/ajustes");
  return { ok: true };
}

export async function updatePromotionAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const enabled = formData.get("enabled") === "on";
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const couponCode = String(formData.get("couponCode") ?? "").trim();
  const ctaText = String(formData.get("ctaText") ?? "").trim();
  const ctaLink = String(formData.get("ctaLink") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();

  let endsAt: Date | null = null;
  if (endsAtRaw) {
    const parsed = new Date(endsAtRaw);
    if (!Number.isNaN(parsed.getTime())) endsAt = parsed;
  }

  if (enabled && !title) {
    return { error: "Poné un título para la promoción antes de activarla." };
  }

  await db.promotion.upsert({
    where: { id: "default" },
    update: { enabled, title, message, couponCode, ctaText, ctaLink, endsAt },
    create: { id: "default", enabled, title, message, couponCode, ctaText, ctaLink, endsAt },
  });

  revalidatePath("/admin/ajustes");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Datos legales del titular + QR de Data Fiscal (se pega el código que da ARCA). */
export async function updateLegalAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const legalName = String(formData.get("legalName") ?? "").trim().slice(0, 160);
  const cuitDigits = String(formData.get("legalCuit") ?? "").replace(/\D/g, "");
  const legalAddress = String(formData.get("legalAddress") ?? "").trim().slice(0, 240);
  const legalEmail = String(formData.get("legalEmail") ?? "").trim().toLowerCase().slice(0, 160);
  const dataFiscalRaw = String(formData.get("dataFiscal") ?? "").trim();

  if (cuitDigits && cuitDigits.length !== 11) {
    return { error: "El CUIT tiene que tener 11 números (ej: 20-12345678-9)." };
  }
  if (legalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(legalEmail)) {
    return { error: "Revisá el email legal: parece incompleto." };
  }
  const legalCuit = cuitDigits
    ? `${cuitDigits.slice(0, 2)}-${cuitDigits.slice(2, 10)}-${cuitDigits.slice(10)}`
    : "";

  // Data Fiscal: ARCA entrega un <a href="..."><img src="..."></a>. Guardamos
  // solo el link y la imagen, y solo si son de dominios oficiales.
  let dataFiscalUrl = "";
  let dataFiscalImg = "";
  if (dataFiscalRaw) {
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(dataFiscalRaw)?.[1] ?? "";
    const src = /src\s*=\s*["']([^"']+)["']/i.exec(dataFiscalRaw)?.[1] ?? "";
    const official = (u: string) => {
      try {
        const host = new URL(u).hostname;
        return /(^|\.)afip\.gob\.ar$|(^|\.)arca\.gob\.ar$/.test(host);
      } catch {
        return false;
      }
    };
    if (!official(href) || !official(src)) {
      return { error: "Pegá el código de Data Fiscal tal cual te lo da ARCA (con el link y la imagen de afip.gob.ar o arca.gob.ar)." };
    }
    dataFiscalUrl = href.replace(/^http:/, "https:");
    dataFiscalImg = src.replace(/^http:/, "https:");
  }

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: { legalName, legalCuit, legalAddress, legalEmail, dataFiscalUrl, dataFiscalImg },
    create: { id: "default", legalName, legalCuit, legalAddress, legalEmail, dataFiscalUrl, dataFiscalImg },
  });

  revalidatePath("/admin/ajustes");
  revalidatePath("/", "layout");
  return { ok: true };
}
