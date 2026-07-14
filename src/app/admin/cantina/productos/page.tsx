import Link from "next/link";
import { getCantinaProducts, getCantinaCategories, getCantinaSuppliers } from "@/lib/cantina-dal";
import { CantinaProductsCatalog } from "@/components/cantina/CantinaProductsCatalog";
import { CantinaCategoryManager } from "@/components/cantina/CantinaCategoryManager";

export default async function CantinaProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [products, categories, suppliers] = await Promise.all([
    getCantinaProducts(),
    getCantinaCategories(),
    getCantinaSuppliers(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {sp.aviso === "con-ventas" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠️ Ese producto tiene ventas registradas, así que no se puede eliminar (se perdería el
          historial). Lo dejamos <strong>oculto</strong> en su lugar.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
            Productos — Cantina
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {products.length} productos cargados
          </p>
        </div>
        <Link
          href="/admin/cantina/productos/nuevo"
          className="rounded-md bg-[var(--color-cantina-vivid)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
        >
          + Cargar producto
        </Link>
      </div>

      <CantinaCategoryManager categories={categories} />

      <CantinaProductsCatalog products={products} categories={categories} suppliers={suppliers} />
    </div>
  );
}
