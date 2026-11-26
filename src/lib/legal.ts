import { getSiteSettings } from "@/lib/dal";
import { waLink } from "@/lib/whatsapp";

// Única fuente de verdad para plazos y datos que aparecen en varias páginas
// legales. Si cambia un plazo, se cambia acá y queda igual en todos lados.

export {
  LEGAL_UPDATED,
  REVOCATION_DAYS,
  EXCHANGE_DAYS,
  CONSUMER_COMPLAINTS_URL,
  AAIP_LEGEND,
} from "@/lib/legal-constants";

export type LegalInfo = {
  storeName: string;
  domain: string;
  legalName: string;
  cuit: string;
  address: string;
  email: string;
  whatsappLink: string | null;
  whatsappNumber: string;
  dataFiscalUrl: string;
  dataFiscalImg: string;
  /** true si faltan nombre, CUIT o domicilio (monotributo en trámite). */
  incomplete: boolean;
};

export async function getLegalInfo(): Promise<LegalInfo> {
  const s = await getSiteSettings();
  const email = s.legalEmail.trim() || s.smtpUser.trim();
  return {
    storeName: "Benito Sneakers",
    domain: "benitosneakers.shop",
    legalName: s.legalName.trim(),
    cuit: s.legalCuit.trim(),
    address: s.legalAddress.trim(),
    email,
    whatsappLink: waLink(s.whatsapp),
    whatsappNumber: s.whatsapp.trim(),
    dataFiscalUrl: s.dataFiscalUrl.trim(),
    dataFiscalImg: s.dataFiscalImg.trim(),
    incomplete: !s.legalName.trim() || !s.legalCuit.trim() || !s.legalAddress.trim(),
  };
}

/** Escapa texto del usuario antes de meterlo en un email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
