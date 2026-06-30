export const AR_PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

export type ShippingConfig = {
  rates: Record<string, number>;
  defaultRate: number;
  freeThreshold: number;
  pickupEnabled: boolean;
  pickupProvince: string;
  pickupNote: string;
  packageWeight: number;
  packageL: number;
  packageW: number;
  packageH: number;
  originCp: string;
};

export type ShippingMethod = "delivery" | "pickup";

/**
 * Calcula el costo de envío de forma determinística (misma lógica en cliente y
 * servidor). El servidor SIEMPRE recalcula esto; nunca confía en el cliente.
 */
export function computeShipping(
  config: ShippingConfig,
  province: string,
  subtotal: number,
  method: ShippingMethod
): number {
  if (method === "pickup") return 0;
  if (config.freeThreshold > 0 && subtotal >= config.freeThreshold) return 0;
  if (!province) return 0;
  const rate = config.rates[province];
  return rate != null ? rate : config.defaultRate;
}

/** ¿Se puede retirar en persona desde esta provincia? */
export function canPickup(config: ShippingConfig, province: string): boolean {
  return (
    config.pickupEnabled &&
    !!province &&
    province.toLowerCase() === config.pickupProvince.toLowerCase()
  );
}
