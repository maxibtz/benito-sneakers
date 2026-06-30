import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { getSiteSettings } from "@/lib/dal";

/**
 * El Access Token puede venir de la variable de entorno (recomendado para
 * producción) o cargarse desde el panel de control (SiteSettings). Esto último
 * permite activar Mercado Pago sin reiniciar el servidor.
 */
export async function getMpAccessToken(): Promise<string | null> {
  const fromEnv = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  const settings = await getSiteSettings();
  const fromDb = settings.mpAccessToken?.trim();
  return fromDb ? fromDb : null;
}

export async function getMpClient() {
  const accessToken = await getMpAccessToken();
  if (!accessToken) return null;
  return new MercadoPagoConfig({ accessToken });
}

export async function getMpPreferenceClient() {
  const client = await getMpClient();
  return client ? new Preference(client) : null;
}

export async function getMpPaymentClient() {
  const client = await getMpClient();
  return client ? new Payment(client) : null;
}

export function getAppUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
