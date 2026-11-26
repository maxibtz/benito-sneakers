// Helpers del Píxel de Meta. Solo se usan en el navegador.
// Si el píxel no está cargado (sin ID, bloqueador de anuncios), no hace nada.

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    __benitoPixelId?: string;
    __benitoPixelQueue?: unknown[][];
  }
}

export const PIXEL_CURRENCY = "ARS";

/** Inserta el script oficial de Meta (mismo código que da el Administrador de eventos). */
export function loadMetaPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  if (window.__benitoPixelId === pixelId) return;

  if (!window.fbq) {
    const n: Fbq = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue!.push(args);
    } as Fbq;
    window.fbq = n;
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = document.getElementsByTagName("script")[0];
    if (s?.parentNode) s.parentNode.insertBefore(t, s);
    else document.head.appendChild(t);
  }

  window.fbq("init", pixelId);
  window.__benitoPixelId = pixelId;

  // Eventos que se dispararon antes de que el píxel terminara de iniciarse
  // (los efectos de la página corren antes que los del layout).
  const pending = window.__benitoPixelQueue ?? [];
  window.__benitoPixelQueue = [];
  for (const args of pending) window.fbq(...args);
}

/**
 * Envía un evento estándar. `eventId` sirve para que Meta no cuente dos veces
 * el mismo evento (por ejemplo, la compra con el ID del pedido).
 */
export function trackPixel(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined") return;
  const args: unknown[] = eventId
    ? ["track", event, params ?? {}, { eventID: eventId }]
    : ["track", event, params ?? {}];
  if (!window.fbq || !window.__benitoPixelId) {
    (window.__benitoPixelQueue ??= []).push(args);
    return;
  }
  window.fbq(...args);
}
