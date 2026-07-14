import { getCantinaProductsForSale, getCantinaCategories } from "@/lib/cantina-dal";
import { CantinaSaleBuilder } from "@/components/cantina/CantinaSaleBuilder";

export default async function CantinaVenderPage() {
  const [products, categories] = await Promise.all([
    getCantinaProductsForSale(),
    getCantinaCategories(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Cargar venta
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tocá un producto para agregarlo. Elegí el medio de pago y cobrá.
        </p>
      </div>
      <CantinaSaleBuilder products={products} categories={categories} />
    </div>
  );
}
