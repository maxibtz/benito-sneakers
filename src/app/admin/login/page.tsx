import Image from "next/image";
import { LoginForm } from "@/components/forms/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-navy)] px-4">
      <div className="w-full max-w-sm rounded-xl bg-[var(--color-navy-light)] p-8 shadow-xl">
        <Image
          src="/brand/logo-mark.png"
          alt="Benito Sneakers"
          width={441}
          height={200}
          priority
          className="mx-auto mb-2 h-20 w-auto"
        />
        <p className="mb-6 text-center text-sm text-[var(--color-skyblue)]">
          Panel de administración
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
