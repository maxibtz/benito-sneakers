import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/AuthForms";

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center sm:px-8">
        <p className="text-[var(--color-store-muted)]">
          El link no es válido o está incompleto.{" "}
          <Link href="/recuperar" className="text-white underline">
            Pedí uno nuevo
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8">
      <ResetPasswordForm token={token} />
    </div>
  );
}
