import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { getSiteSettings, getShippingConfig } from "@/lib/dal";
import { db } from "@/lib/db";
import { CheckoutForm } from "@/components/forms/CheckoutForm";

export default async function CheckoutPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/ingresar?next=/checkout");

  const [customer, settings, shipping] = await Promise.all([
    db.customer.findUnique({ where: { id: session.customerId } }),
    getSiteSettings(),
    getShippingConfig(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="font-display mb-6 text-3xl font-medium tracking-tight text-white">
        Finalizar compra
      </h1>
      <CheckoutForm
        customerId={session.customerId}
        defaultName={customer?.name ?? ""}
        defaultEmail={customer?.email ?? ""}
        defaultPhone={customer?.phone ?? ""}
        transferAlias={settings.transferAlias}
        shipping={shipping}
      />
    </div>
  );
}
