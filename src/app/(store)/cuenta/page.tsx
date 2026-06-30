import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { logoutCustomerAction } from "@/actions/customer-auth";
import { VerifyEmailForm } from "@/components/forms/AuthForms";
import { db } from "@/lib/db";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

const STATUS_LABEL: Record<string, string> = {
  NUEVO: "Nuevo",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/ingresar?next=/cuenta");

  const customer = await db.customer.findUnique({
    where: { id: session.customerId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
    },
  });
  if (!customer) redirect("/ingresar?next=/cuenta");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-12 sm:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-white">
            Hola, {customer.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-store-muted)]">{customer.email}</p>
        </div>
        <form action={logoutCustomerAction}>
          <button
            type="submit"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      {!customer.emailVerified && <VerifyEmailForm />}

      <div className="rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-6">
        <h2 className="mb-4 font-medium text-white">Mis pedidos</h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-[var(--color-store-muted)]">
            Todavía no hiciste pedidos.{" "}
            <Link href="/" className="text-[var(--color-lilac)] hover:underline">
              Ver catálogo
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/10">
            {customer.orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link
                    href={`/pedido-confirmado/${order.id}`}
                    className="text-sm font-medium text-white hover:text-[var(--color-lilac)]"
                  >
                    Pedido #{order.id.slice(-8)}
                  </Link>
                  <p className="text-xs text-[var(--color-store-muted)]">
                    {order.createdAt.toLocaleDateString("es-AR")} ·{" "}
                    {order.items.length} producto(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{formatARS(order.total)}</p>
                  <p className="text-xs text-[var(--color-store-muted)]">
                    {STATUS_LABEL[order.status]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
