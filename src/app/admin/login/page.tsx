import { LoginForm } from "@/components/forms/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-navy)] px-4">
      <div className="w-full max-w-sm rounded-xl bg-[var(--color-navy-light)] p-8 shadow-xl">
        <h1 className="mb-1 text-center text-2xl font-bold text-[var(--color-lilac)]">
          Benito Sneakers
        </h1>
        <p className="mb-6 text-center text-sm text-[var(--color-skyblue)]">
          Panel de administración
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
