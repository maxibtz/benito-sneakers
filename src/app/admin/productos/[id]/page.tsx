import { notFound } from "next/navigation";
import { getProduct, getSections } from "@/lib/dal";
import { updateProductAction } from "@/actions/products";
import { ProductForm } from "@/components/forms/ProductForm";

function parseCostItems(
  raw: string,
  fallbackCost: number | null
): { name: string; amount: number }[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((it) => ({
        name: String(it?.name ?? ""),
        amount: Number(it?.amount) || 0,
      }));
    }
  } catch {
    // ignore
  }
  // Producto viejo con costo único: lo mostramos como un ítem "Costo".
  if (fallbackCost && fallbackCost > 0) return [{ name: "Costo", amount: fallbackCost }];
  return [];
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, sections] = await Promise.all([getProduct(id), getSections()]);
  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Editar {product.brand} {product.model}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
      </div>
      <ProductForm
        action={boundAction}
        sections={sections.map((s) => ({ id: s.id, name: s.name }))}
        submitLabel="Guardar cambios"
        defaultValues={{
          brand: product.brand,
          model: product.model,
          description: product.description,
          sectionId: product.sectionId,
          sku: product.sku,
          price: product.price,
          salePrice: product.salePrice,
          costItems: parseCostItems(product.costBreakdown, product.cost),
          active: product.active,
          variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
          images: product.images?.split(",").filter(Boolean) ?? [],
          videos: product.videos?.split(",").filter(Boolean) ?? [],
        }}
      />
    </div>
  );
}
