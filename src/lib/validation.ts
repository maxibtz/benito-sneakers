import { z } from "zod";

export const productSchema = z.object({
  brand: z.string().min(1, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  category: z.string().optional().default(""),
  sku: z.string().min(1, "El SKU es obligatorio"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  salePrice: z.coerce.number().optional(),
  cost: z.coerce.number().optional(),
  active: z.coerce.boolean().optional().default(true),
});

export type VariantInput = { size: string; stock: number };

export function parseVariants(raw: string): VariantInput[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [size, stock] = line.split(",").map((part) => part.trim());
      return { size, stock: Number(stock) || 0 };
    })
    .filter((v) => v.size.length > 0);
}
