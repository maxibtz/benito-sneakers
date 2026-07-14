import { getCantinaSales } from "@/lib/cantina-dal";
import { CantinaSalesHistory } from "@/components/cantina/CantinaSalesHistory";

export default async function CantinaVentasPage() {
  const sales = await getCantinaSales();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Historial de ventas — Cantina
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Todos los tickets cargados.</p>
      </div>
      <CantinaSalesHistory sales={sales} />
    </div>
  );
}
