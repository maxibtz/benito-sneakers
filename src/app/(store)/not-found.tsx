import Link from "next/link";

/** Página no encontrada dentro de la tienda (link viejo o producto dado de baja). */
export default function StoreNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-store-muted)]">Error 404</p>
      <h1 className="font-display mt-4 text-3xl font-medium tracking-tight text-white sm:text-4xl">
        Este link ya no está disponible
      </h1>
      <p className="mt-4 text-[var(--color-store-muted)]">
        Puede que el producto se haya agotado o que el link esté mal escrito. Mirá lo que tenemos
        disponible hoy.
      </p>
      <Link
        href="/#catalogo"
        className="btn-press mt-8 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[var(--color-store-bg)] hover:bg-white/90"
      >
        Ver catálogo
      </Link>
    </div>
  );
}
