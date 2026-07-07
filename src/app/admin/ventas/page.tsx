import { getManualSales, getManualSalesStats, getProductsForSale } from "@/lib/dal";
import { ManualSaleForm } from "@/components/forms/ManualSaleForm";
import { ManualSalesHistory } from "@/components/admin/ManualSalesHistory";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export default async function VentasManualesPage() {
  const [sales, stats, products] = await Promise.all([
    getManualSales(),
    getManualSalesStats(),
    getProductsForSale(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Ventas manuales
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cargá las ventas que hacés por fuera de la tienda (en persona, WhatsApp, mayorista). Se
          suman a los ingresos y la ganancia del dashboard.
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Ventas cargadas" value={String(stats.count)} />
        <Stat label="Facturado (manual)" value={formatARS(stats.revenue)} />
        <Stat label="Costo (manual)" value={formatARS(stats.cost)} muted />
        <Stat label="Ganancia (manual)" value={formatARS(stats.profit)} good={stats.profit >= 0} />
      </div>

      {/* Formulario de carga */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Cargar una venta
        </h2>
        <ManualSaleForm products={products} />
      </div>

      {/* Historial con filtros */}
      <ManualSalesHistory sales={sales} />
    </div>
  );
}

function Stat({
  label,
  value,
  muted,
  good,
}: {
  label: string;
  value: string;
  muted?: boolean;
  good?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          good === undefined
            ? muted
              ? "text-gray-600 dark:text-gray-300"
              : "text-[var(--color-navy)] dark:text-white"
            : good
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
