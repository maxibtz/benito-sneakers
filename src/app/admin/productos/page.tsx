import Link from "next/link";
import { getProductsWithStats, getSections } from "@/lib/dal";
import { ProductsCatalog } from "@/components/admin/ProductsCatalog";

export default async function ProductsPage() {
  const [products, sections] = await Promise.all([getProductsWithStats(), getSections()]);

  return (
    <div className="flex flex-col gap-6">
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
