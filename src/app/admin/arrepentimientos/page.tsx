import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateRevocationAction } from "@/actions/revocation";
import { REVOCATION_DAYS } from "@/lib/legal";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_CURSO: "En curso",
  RESUELTO: "Resuelto",
  RECHAZADO: "Rechazado",
};

const STATUS_CLASS: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  EN_CURSO: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  RESUELTO: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  RECHAZADO: "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(d);
}

export default async function RevocationsAdminPage() {
  await requireAdmin();
  const requests = await db.revocationRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const pending = requests.filter((r) => r.status === "PENDIENTE").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Arrepentimientos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Solicitudes del Botón de arrepentimiento. El cliente ya recibió su código. Contactalo para
          coordinar la devolución (a cargo de la tienda) y reintegrar el total pagado. Plazo legal
          para pedirlo: {REVOCATION_DAYS} días corridos desde que recibió el producto.
        </p>
        {pending > 0 && (
          <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
            {pending} pendiente{pending === 1 ? "" : "s"} de gestionar.
          </p>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-sm dark:bg-[#151833] dark:text-gray-400 dark:shadow-none">
          Todavía no hay solicitudes.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#151833] dark:shadow-none"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-[var(--color-navy)] dark:text-white">
                    {r.code}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[r.status] ?? ""}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.createdAt)}</span>
              </div>

              <div className="mt-3 grid gap-1 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
                <p>
                  <strong>Cliente:</strong> {r.name}
                  {r.dni ? ` — DNI ${r.dni}` : ""}
                </p>
                <p>
                  <strong>Contacto:</strong> {r.email} · {r.phone}
                </p>
                <p>
                  <strong>Pedido indicado:</strong>{" "}
                  {r.orderId ? (
                    <Link href={`/admin/pedidos/${r.orderId}`} className="underline underline-offset-4">
                      #{r.orderId.slice(-8)}
                    </Link>
                  ) : (
                    r.orderRef || "—"
                  )}
                  {r.orderRef && !r.orderId ? " (no coincide con un pedido + email del sistema)" : ""}
                </p>
                {r.details && (
                  <p className="sm:col-span-2">
                    <strong>Comentarios:</strong> {r.details}
                  </p>
                )}
              </div>

              <form action={updateRevocationAction} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                <input type="hidden" name="id" value={r.id} />
                <label className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                  Estado
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--color-navy)] dark:border-white/15 dark:bg-white/5 dark:text-white"
                  >
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-1 flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                  Nota interna
                  <input
                    name="adminNote"
                    defaultValue={r.adminNote}
                    placeholder="Ej: reintegrado por MP el 30/11"
                    className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--color-navy)] dark:border-white/15 dark:bg-white/5 dark:text-white"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-md bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)]"
                >
                  Guardar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
