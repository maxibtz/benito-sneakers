import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-auth";
import { getSiteSettings, getShippingConfig } from "@/lib/dal";
import { db } from "@/lib/db";
import { CheckoutForm } from "@/components/forms/CheckoutForm";
import { TrackInitiateCheckout } from "@/components/pixel/PixelEvents";

export default async function CheckoutPage() {
  // No hace falta cuenta para comprar: si hay sesión, completamos sus datos.
  const session = await getCustomerSession();

  const [customer, settings, shipping] = await Promise.all([
    session ? db.customer.findUnique({ where: { id: session.customerId } }) : null,
    getSiteSettings(),
    getShippingConfig(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <TrackInitiateCheckout />
      <h1 className="font-display mb-6 text-3xl font-medium tracking-tight text-white">
        Finalizar compra
      </h1>
      {!session && (
        <p className="mb-6 text-sm text-[var(--color-store-muted)]">
          No necesitás crear una cuenta para comprar. ¿Ya tenés una?{" "}
          <Link href="/ingresar?next=/checkout" className="text-white underline underline-offset-4">
            Ingresá
          </Link>{" "}
          y completamos tus datos.
        </p>
      )}
      <CheckoutForm
        customerId={session?.customerId ?? null}
        defaultName={customer?.name ?? ""}
        defaultEmail={customer?.email ?? ""}
        defaultPhone={customer?.phone ?? ""}
        transferAlias={settings.transferAlias}
        shipping={shipping}
      />
    </div>
  );
}
