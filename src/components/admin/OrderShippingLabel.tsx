"use client";

export function OrderShippingLabel({
  orderId,
  customerName,
  dni,
  phone,
  street,
  streetNumber,
  floorApt,
  city,
  province,
  postalCode,
  itemsCount,
  weightKg,
  declaredValue,
}: {
  orderId: string;
  customerName: string;
  dni: string;
  phone: string;
  street: string;
  streetNumber: string;
  floorApt: string | null;
  city: string;
  province: string;
  postalCode: string;
  itemsCount: number;
  weightKg: number;
  declaredValue: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <div className="no-print mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-navy)] dark:text-white">
          Etiqueta de envío
        </h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)]"
        >
          🖨️ Imprimir etiqueta
        </button>
      </div>

      <div className="print-label rounded-lg border-2 border-dashed border-gray-300 p-5 font-mono text-sm text-gray-800 dark:border-gray-600 dark:text-gray-100">
        <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Remitente</p>
        <p className="font-semibold">Benito Sneakers</p>
        <p>Formosa Capital (CP 3600)</p>

        <div className="my-4 border-t border-dashed border-gray-300 dark:border-gray-600" />

        <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Destinatario</p>
        <p className="text-base font-bold">{customerName}</p>
        <p>DNI: {dni}</p>
        <p>Tel: {phone}</p>
        <p>
          {street} {streetNumber}
          {floorApt ? `, ${floorApt}` : ""}
        </p>
        <p className="font-bold">
          {city}, {province} — CP {postalCode}
        </p>

        <div className="my-4 border-t border-dashed border-gray-300 dark:border-gray-600" />

        <p>Pedido #{orderId.slice(-8)}</p>
        <p>
          Contenido: {itemsCount} par{itemsCount === 1 ? "" : "es"} de zapatillas
        </p>
        <p>Peso aprox.: {weightKg.toFixed(1)} kg</p>
        <p>Valor declarado: {declaredValue}</p>
      </div>
    </div>
  );
}
