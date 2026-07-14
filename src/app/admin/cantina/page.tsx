import Link from "next/link";
import { getCantinaSalesForDashboard, getCantinaLowStockProducts, getCantinaProducts } from "@/lib/cantina-dal";
import { CantinaDashboard } from "@/components/cantina/CantinaDashboard";

export default async function CantinaDashboardPage() {
  const [sales, lowStock, products] = await Promise.all([
    getCantinaSalesForDashboard(),
    getCantinaLowStockProducts(),
    getCantinaProducts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
            🍔 Cantina — Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Resumen de ventas, stock y márgenes de la cantina.
          </p>
        </div>
        <Link
          href="/admin/cantina/vender"
          className="rounded-md bg-[var(--color-cantina-vivid)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
        >
          + Cargar venta
        </Link>
      </div>

      <CantinaDashboard sales={sales} lowStock={lowStock} products={products} />
    </div>
  );
}
