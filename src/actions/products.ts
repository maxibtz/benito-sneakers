"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema, parseVariants } from "@/lib/validation";
import { saveProductImages, saveProductVideos } from "@/lib/uploads";
import { getUsdRate, roundToStep } from "@/lib/usd-rate";

export type EchoValues = {
  brand: string;
  model: string;
  description: string;
  sku: string;
  sectionId: string;
  variants: string;
  variantsJson: string;
  active: boolean;
};

export type ProductFormState = { error?: string; values?: EchoValues };

/** Devuelve lo que el usuario cargó, para repoblar el form si hay error. */
function echoValues(formData: FormData): EchoValues {
  return {
    brand: String(formData.get("brand") ?? ""),
    model: String(formData.get("model") ?? ""),
    description: String(formData.get("description") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    sectionId: String(formData.get("sectionId") ?? ""),
    variants: String(formData.get("variants") ?? ""),
    variantsJson: String(formData.get("variantsJson") ?? ""),
    active: formData.get("active") === "on",
  };
}

/** Junta TODOS los mensajes de error de validación en un texto claro. */
function allErrors(parsed: { error: { issues: { message: string }[] } }): string {
  const msgs = [...new Set(parsed.error.issues.map((i) => i.message))];
  return "Faltan o hay errores en: " + msgs.join(" · ");
}

/**
 * Talles y stock: el form manda filas estructuradas como JSON
 * ([{size, stock}]). Se acepta también el formato viejo de texto
 * ("35, 2" por línea) como fallback.
 */
function resolveVariants(formData: FormData): { size: string; stock: number }[] {
  const raw = formData.get("variantsJson");
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const rows = parsed
          .map((v) => ({
            size: String(v?.size ?? "").trim(),
            stock: Math.max(0, Math.floor(Number(v?.stock)) || 0),
          }))
          .filter((v) => v.size.length > 0);
        // Sin talles repetidos (romperían la restricción única): gana la última fila.
        const bySize = new Map(rows.map((r) => [r.size, r]));
        return [...bySize.values()];
      }
    } catch {
      // caemos al formato viejo
    }
  }
  return parseVariants(String(formData.get("variants") ?? ""));
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const values = echoValues(formData);
  const pricing = await resolvePricing(formData);
  if ("error" in pricing) return { error: pricing.error, values };

  const parsed = productSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    description: formData.get("description"),
    category: formData.get("category") ?? undefined,
    sku: formData.get("sku"),
    price: pricing.price,
    salePrice: pricing.salePrice,
    cost: formData.get("cost"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: allErrors(parsed), values };
  }

  const variants = resolveVariants(formData);
  if (variants.length === 0) {
    return { error: "Agregá al menos un talle con su cantidad.", values };
  }

  const existing = await db.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existing) {
    return { error: `Ya existe un producto con el SKU "${parsed.data.sku}". Usá otro.`, values };
  }

  const { salePrice: rawSale, cost: _ignored, ...rest } = parsed.data;
  const salePrice = normalizeSalePrice(rawSale, parsed.data.price);
  const { breakdown, cost } = parseCostBreakdown(formData.get("costBreakdown"), pricing.priceCurrency, pricing.rate);
  const { sectionId, category } = await resolveSection(formData);
  const files = formData.getAll("images") as File[];
  const imagePaths = await saveProductImages(files, parsed.data.sku);
  const videoFiles = formData.getAll("videos") as File[];
  const videoPaths = await saveProductVideos(videoFiles, parsed.data.sku);

  await db.product.create({
    data: {
      ...rest,
      category,
      sectionId,
      salePrice,
      cost,
      costBreakdown: breakdown,
      priceCurrency: pricing.priceCurrency,
      priceUsd: pricing.priceUsd,
      salePriceUsd: pricing.salePriceUsd,
      images: imagePaths.join(","),
      videos: videoPaths.join(","),
      variants: { create: variants },
    },
  });

  // Refresca TODA la web (panel + tienda) para que el producto aparezca al instante.
  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const values = echoValues(formData);
  const pricing = await resolvePricing(formData);
  if ("error" in pricing) return { error: pricing.error, values };

  const parsed = productSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    description: formData.get("description"),
    category: formData.get("category") ?? undefined,
    sku: formData.get("sku"),
    price: pricing.price,
    salePrice: pricing.salePrice,
    cost: formData.get("cost"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: allErrors(parsed), values };
  }

  const variants = resolveVariants(formData);
  if (variants.length === 0) {
    return { error: "Agregá al menos un talle con su cantidad.", values };
  }

  const current = await db.product.findUnique({ where: { id } });
  if (!current) {
    return { error: "Producto no encontrado.", values };
  }

  const { salePrice: rawSale, cost: _ignored, ...rest } = parsed.data;
  const salePrice = normalizeSalePrice(rawSale, parsed.data.price);
  const { breakdown, cost } = parseCostBreakdown(formData.get("costBreakdown"), pricing.priceCurrency, pricing.rate);
  const { sectionId, category } = await resolveSection(formData);
  const files = (formData.getAll("images") as File[]).filter((f) => f.size > 0);
  const newImagePaths = await saveProductImages(files, parsed.data.sku);
  // Imágenes existentes que el usuario decidió conservar, en el orden que eligió.
  const keptImages = parseExistingImages(formData.get("existingImages"), current.images);
  const allImages = [...keptImages, ...newImagePaths];
  // Videos: mismos criterios que las imágenes (conservados + nuevos).
  const videoFiles = (formData.getAll("videos") as File[]).filter((f) => f.size > 0);
  const newVideoPaths = await saveProductVideos(videoFiles, parsed.data.sku);
  const keptVideos = parseExistingImages(formData.get("existingVideos"), current.videos);
  const allVideos = [...keptVideos, ...newVideoPaths];

  try {
    await db.$transaction(async (tx) => {
      // Sincronizar talles SIN borrar y recrear: los talles vendidos están
      // enlazados a pedidos históricos y la base impide eliminarlos.
      const existing = await tx.variant.findMany({
        where: { productId: id },
        include: { _count: { select: { orderItems: true } } },
      });
      const existingBySize = new Map(existing.map((v) => [v.size, v]));
      const submittedSizes = new Set(variants.map((v) => v.size));

      for (const v of variants) {
        const ex = existingBySize.get(v.size);
        if (ex) {
          if (ex.stock !== v.stock) {
            await tx.variant.update({ where: { id: ex.id }, data: { stock: v.stock } });
          }
        } else {
          await tx.variant.create({ data: { productId: id, size: v.size, stock: v.stock } });
        }
      }
      for (const ex of existing) {
        if (submittedSizes.has(ex.size)) continue;
        if (ex._count.orderItems > 0) {
          // Tiene ventas: no se puede borrar; queda sin stock (no se muestra).
          await tx.variant.update({ where: { id: ex.id }, data: { stock: 0 } });
        } else {
          await tx.variant.delete({ where: { id: ex.id } });
        }
      }

      await tx.product.update({
        where: { id },
        data: {
          ...rest,
          category,
          sectionId,
          salePrice,
          cost,
          costBreakdown: breakdown,
          priceCurrency: pricing.priceCurrency,
          priceUsd: pricing.priceUsd,
          salePriceUsd: pricing.salePriceUsd,
          images: allImages.join(","),
          videos: allVideos.join(","),
        },
      });
    });
  } catch (err) {
    console.error("[products] error al actualizar:", err);
    return {
      error: "No pudimos guardar los cambios por un error interno. Probá de nuevo en un momento.",
      values,
    };
  }

  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

/**
 * Imágenes existentes a conservar (orden elegido por el usuario). Solo permite
 * las que ya pertenecían al producto (seguridad anti-inyección de rutas).
 */
function parseExistingImages(raw: FormDataEntryValue | null, currentCsv: string): string[] {
  const current = currentCsv ? currentCsv.split(",").filter(Boolean) : [];
  if (typeof raw !== "string") return current;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return current;
    const allowed = new Set(current);
    return parsed.map((x) => String(x)).filter((x) => allowed.has(x));
  } catch {
    return current;
  }
}

async function resolveSection(
  formData: FormData
): Promise<{ sectionId: string | null; category: string }> {
  const sectionId = String(formData.get("sectionId") ?? "").trim() || null;
  if (!sectionId) return { sectionId: null, category: "" };
  const section = await db.section.findUnique({ where: { id: sectionId } });
  if (!section) return { sectionId: null, category: "" };
  return { sectionId: section.id, category: section.name };
}

type ResolvedPricing =
  | { error: string }
  | {
      price: string; // string porque así los espera productSchema (z.coerce.number)
      salePrice: string;
      priceCurrency: "ARS" | "USD";
      priceUsd: number | null;
      salePriceUsd: number | null;
      rate: number; // cotización usada (0 si es ARS, no hace falta) — se reusa para los costos
    };

/**
 * Si el admin cargó el precio en USD, acá se convierte a ARS usando la
 * cotización del momento (ver src/lib/usd-rate.ts) — el precio en pesos SIEMPRE
 * es el que se cobra; priceUsd/salePriceUsd quedan guardados para que el
 * recálculo diario automático los vuelva a convertir sin que el admin haga nada.
 */
async function resolvePricing(formData: FormData): Promise<ResolvedPricing> {
  const currency = String(formData.get("priceCurrency") ?? "ARS") === "USD" ? "USD" : "ARS";

  if (currency === "ARS") {
    return {
      price: String(formData.get("price") ?? ""),
      salePrice: String(formData.get("salePrice") ?? ""),
      priceCurrency: "ARS",
      priceUsd: null,
      salePriceUsd: null,
      rate: 0,
    };
  }

  const priceUsd = Number(formData.get("priceUsd"));
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return { error: "Ingresá el precio en dólares." };
  }
  const { rate } = await getUsdRate();
  if (!rate || rate <= 0) {
    return {
      error:
        "Todavía no pudimos obtener la cotización del dólar. Probá de nuevo en un momento, o cargá el precio en pesos.",
    };
  }
  const salePriceUsdRaw = Number(formData.get("salePriceUsd"));
  const salePriceUsd = Number.isFinite(salePriceUsdRaw) && salePriceUsdRaw > 0 ? salePriceUsdRaw : null;

  return {
    price: String(roundToStep(priceUsd * rate, 100)),
    salePrice: salePriceUsd != null ? String(roundToStep(salePriceUsd * rate, 100)) : "",
    priceCurrency: "USD",
    priceUsd,
    salePriceUsd,
    rate,
  };
}

function normalizeSalePrice(
  salePrice: number | undefined,
  price: number
): number | null {
  if (salePrice == null || Number.isNaN(salePrice) || salePrice <= 0) return null;
  if (salePrice >= price) return null; // no es promo si no es menor al precio real
  return salePrice;
}

/**
 * El breakdown se guarda SIEMPRE en la moneda nativa tal como la cargó el
 * admin (USD si el producto está en dólares). `cost` (el campo numérico que
 * usa el resto del panel para ganancia/margen) es SIEMPRE en ARS: si es un
 * producto en USD, se convierte acá con la cotización del momento — y se
 * vuelve a recalcular solo en el refresh diario (ver refreshUsdPricedProducts).
 */
function parseCostBreakdown(
  raw: FormDataEntryValue | null,
  currency: "ARS" | "USD",
  rate: number
): { breakdown: string; cost: number } {
  if (typeof raw !== "string") return { breakdown: "[]", cost: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { breakdown: "[]", cost: 0 };
    const clean = parsed
      .map((it) => ({
        name: String(it?.name ?? "").trim(),
        amount: Number(it?.amount) || 0,
      }))
      .filter((it) => it.name.length > 0 || it.amount > 0);
    const nativeSum = clean.reduce((sum, it) => sum + (it.amount > 0 ? it.amount : 0), 0);
    const cost = currency === "USD" ? nativeSum * rate : nativeSum;
    return { breakdown: JSON.stringify(clean), cost };
  } catch {
    return { breakdown: "[]", cost: 0 };
  }
}

export async function deleteProductAction(id: string) {
  await requireAdmin();

  // Un producto con ventas no se puede borrar (los pedidos históricos lo
  // referencian): se oculta de la tienda y se avisa en el listado.
  const sales = await db.orderItem.count({ where: { productId: id } });
  if (sales > 0) {
    await db.product.update({ where: { id }, data: { active: false } });
    revalidatePath("/", "layout");
    redirect("/admin/productos?aviso=con-ventas");
  }

  await db.product.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { active } });
  revalidatePath("/", "layout");
}
