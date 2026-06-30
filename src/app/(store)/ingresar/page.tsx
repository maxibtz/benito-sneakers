import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { AuthForms } from "@/components/forms/AuthForms";

export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const session = await getCustomerSession();
  const target = next && next.startsWith("/") ? next : "/";
  if (session) redirect(target);

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16 sm:px-8">
      <h1 className="font-display mb-2 text-center text-3xl font-medium tracking-tight text-white">
        Tu cuenta
      </h1>
      <p className="mb-8 text-center text-sm text-[var(--color-store-muted)]">
        Ingresá o creá tu cuenta para comprar y seguir tus pedidos.
      </p>
      <AuthForms next={target} />
    </div>
  );
}
