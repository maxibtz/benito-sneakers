import Link from "next/link";
import { getProductsWithStats, getSections } from "@/lib/dal";
import { ProductsCatalog } from "@/components/admin/ProductsCatalog";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [products, sections] = await Promise.all([getProductsWithStats(), getSections()]);

  return (
    <div className="flex flex-col gap-6">
      {sp.aviso === "con-ventas" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠️ Ese producto tiene ventas registradas, así que no se puede eliminar (se perdería el
          historial). Lo dejamos <strong>oculto de la tienda</strong> en su lugar.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">Productos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {products.length} productos cargados
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-md bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)]"
        >
          + Cargar producto
        </Link>
      </div>

      <ProductsCatalog
        products={products}
        sections={sections.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
