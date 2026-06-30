"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema, parseVariants } from "@/lib/validation";
import { saveProductImages } from "@/lib/uploads";

export type ProductFormState = { error?: string };

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    description: formData.get("description"),
    category: formData.get("category") ?? undefined,
    sku: formData.get("sku"),
    price: formData.get("price"),
    salePrice: formData.get("salePrice"),
    cost: formData.get("cost"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const variants = parseVariants(String(formData.get("variants") ?? ""));
  if (variants.length === 0) {
    return { error: "Agregá al menos un talle con su stock." };
  }

  const existing = await db.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existing) {
    return { error: "Ya existe un producto con ese SKU." };
  }

  const { salePrice: rawSale, cost: _ignored, ...rest } = parsed.data;
  const salePrice = normalizeSalePrice(rawSale, parsed.data.price);
  const { breakdown, cost } = parseCostBreakdown(formData.get("costBreakdown"));
  const { sectionId, category } = await resolveSection(formData);
  const files = formData.getAll("images") as File[];
  const imagePaths = await saveProductImages(files, parsed.data.sku);

  await db.product.create({
    data: {
      ...rest,
      category,
      sectionId,
      salePrice,
      cost,
      costBreakdown: breakdown,
      images: imagePaths.join(","),
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
  const parsed = productSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    description: formData.get("description"),
    category: formData.get("category") ?? undefined,
    sku: formData.get("sku"),
    price: formData.get("price"),
    salePrice: formData.get("salePrice"),
    cost: formData.get("cost"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const variants = parseVariants(String(formData.get("variants") ?? ""));
  if (variants.length === 0) {
    return { error: "Agregá al menos un talle con su stock." };
  }

  const current = await db.product.findUnique({ where: { id } });
  if (!current) {
    return { error: "Producto no encontrado." };
  }

  const { salePrice: rawSale, cost: _ignored, ...rest } = parsed.data;
  const salePrice = normalizeSalePrice(rawSale, parsed.data.price);
  const { breakdown, cost } = parseCostBreakdown(formData.get("costBreakdown"));
  const { sectionId, category } = await resolveSection(formData);
  const files = (formData.getAll("images") as File[]).filter((f) => f.size > 0);
  const newImagePaths = await saveProductImages(files, parsed.data.sku);
  const existingImages = current.images ? current.images.split(",").filter(Boolean) : [];
  const allImages = [...existingImages, ...newImagePaths];

  await db.$transaction([
    db.variant.deleteMany({ where: { productId: id } }),
    db.product.update({
      where: { id },
      data: {
        ...rest,
        category,
        sectionId,
        salePrice,
        cost,
        costBreakdown: breakdown,
        images: allImages.join(","),
        variants: { create: variants },
      },
    }),
  ]);

  revalidatePath("/", "layout");
  redirect("/admin/productos");
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

function normalizeSalePrice(
  salePrice: number | undefined,
  price: number
): number | null {
  if (salePrice == null || Number.isNaN(salePrice) || salePrice <= 0) return null;
  if (salePrice >= price) return null; // no es promo si no es menor al precio real
  return salePrice;
}

function parseCostBreakdown(raw: FormDataEntryValue | null): {
  breakdown: string;
  cost: number;
} {
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
    const cost = clean.reduce((sum, it) => sum + (it.amount > 0 ? it.amount : 0), 0);
    return { breakdown: JSON.stringify(clean), cost };
  } catch {
    return { breakdown: "[]", cost: 0 };
  }
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { active } });
  revalidatePath("/", "layout");
}
