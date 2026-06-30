/** Normaliza un número de WhatsApp dejando solo dígitos (formato wa.me). */
export function waNumber(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\D/g, "");
}

/** Construye un link de click-to-chat de WhatsApp, o null si no hay número. */
export function waLink(number: string | null | undefined, message?: string): string | null {
  const n = waNumber(number);
  if (!n) return null;
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${n}${q}`;
}

export const DEFAULT_WA_MESSAGE = "¡Hola Benito Sneakers! Tengo una consulta 👟";
