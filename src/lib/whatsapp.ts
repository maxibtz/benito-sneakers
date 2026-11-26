/**
 * Normaliza un número de WhatsApp al formato de wa.me (solo dígitos, con
 * código de país). Los celulares argentinos necesitan 549 + característica +
 * número; si se cargó sin eso (ej: 3704786853), se agrega solo.
 */
export function waNumber(raw: string | null | undefined): string {
  let n = (raw ?? "").replace(/\D/g, "");
  if (!n) return "";
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("0")) n = n.slice(1);
  if (n.length === 10) return "549" + n;
  if (n.length === 12 && n.startsWith("54") && !n.startsWith("549")) return "549" + n.slice(2);
  return n;
}

/** Construye un link de click-to-chat de WhatsApp, o null si no hay número. */
export function waLink(number: string | null | undefined, message?: string): string | null {
  const n = waNumber(number);
  if (!n) return null;
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${n}${q}`;
}

export const DEFAULT_WA_MESSAGE = "¡Hola Benito Sneakers! Tengo una consulta 👟";
