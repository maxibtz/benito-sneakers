import { getSectionStats } from "@/lib/dal";
import {
  toggleSectionAction,
  moveSectionAction,
  deleteSectionAction,
} from "@/actions/sections";
import { NewSectionForm, SectionRenameForm } from "@/components/forms/SectionForms";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export default async function SeccionesPage() {
  const sections = await getSectionStats();

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Secciones
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Separá tu catálogo por secciones (Zapatillas, Gorras, etc.). El cliente las usa para
          filtrar en la tienda.
        </p>
      </div>

      <NewSectionForm />

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Sección</th>
              <th className="px-4 py-3">Productos</th>
              <th className="px-4 py-3">Vendidos</th>
              <th className="px-4 py-3">Ingresos</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {sections.map((s) => (
              <tr key={s.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <form action={moveSectionAction.bind(null, s.id, -1)}>
                      <button type="submit" className="rounded px-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Subir">↑</button>
                    </form>
                    <form action={moveSectionAction.bind(null, s.id, 1)}>
                      <button type="submit" className="rounded px-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Bajar">↓</button>
                    </form>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <SectionRenameForm id={s.id} name={s.name} />
                </td>
                <td className="px-4 py-3">{s.products}</td>
                <td className="px-4 py-3">{s.units}</td>
                <td className="px-4 py-3">{formatARS(s.revenue)}</td>
                <td className="px-4 py-3">
                  <form action={toggleSectionAction.bind(null, s.id, !s.active)}>
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        s.active
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                      }`}
                    >
                      {s.active ? "Visible" : "Oculta"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteSectionAction.bind(null, s.id)}>
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sections.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no creaste secciones.
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Al eliminar una sección, sus productos quedan sin sección (podés reasignarlos editándolos).
      </p>
    </div>
  );
}
