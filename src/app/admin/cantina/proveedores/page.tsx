import { getCantinaSuppliersWithStats } from "@/lib/cantina-dal";
import {
  NewSupplierForm,
  SupplierEditForm,
  SupplierDeleteButton,
} from "@/components/forms/CantinaSupplierForms";

export default async function CantinaProveedoresPage() {
  const suppliers = await getCantinaSuppliersWithStats();

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Proveedores — Cantina
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Los proveedores de bebidas y snacks para poder comparar costos y márgenes.
        </p>
      </div>

      <NewSupplierForm />

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-[#151833] dark:shadow-none">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <SupplierEditForm id={s.id} name={s.name} contact={s.contact} notes={s.notes} />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{s.productCount} producto{s.productCount === 1 ? "" : "s"}</span>
              <SupplierDeleteButton id={s.id} name={s.name} />
            </div>
          </div>
        ))}
        {suppliers.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no cargaste proveedores.
          </p>
        )}
      </div>
    </div>
  );
}
