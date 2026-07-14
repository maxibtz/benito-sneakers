import { notFound } from "next/navigation";
import { getCantinaCategories, getCantinaSuppliers, getCantinaProduct } from "@/lib/cantina-dal";
import { CantinaProductForm } from "@/components/forms/CantinaProductForm";

export default async function EditarCantinaProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, suppliers] = await Promise.all([
    getCantinaProduct(id),
    getCantinaCategories(),
    getCantinaSuppliers(),
  ]);
  if (!product) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Editar producto — Cantina
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{product.name}</p>
      </div>
      <CantinaProductForm
        categories={categories}
        suppliers={suppliers}
        product={{
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          cost: product.cost,
          price: product.price,
          stock: product.stock,
          minStock: product.minStock,
          unit: product.unit,
          active: product.active,
        }}
      />
    </div>
  );
}
