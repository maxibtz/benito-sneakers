import { getCantinaCategories, getCantinaSuppliers } from "@/lib/cantina-dal";
import { CantinaProductForm } from "@/components/forms/CantinaProductForm";

export default async function NuevoCantinaProductoPage() {
  const [categories, suppliers] = await Promise.all([getCantinaCategories(), getCantinaSuppliers()]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Nuevo producto — Cantina
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bebidas, snacks o cualquier ítem que vendas en la cantina.
        </p>
      </div>
      <CantinaProductForm categories={categories} suppliers={suppliers} />
    </div>
  );
}
