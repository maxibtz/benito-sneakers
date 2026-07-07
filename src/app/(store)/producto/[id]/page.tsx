import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/dal";
import { AddToCartForm } from "@/components/forms/AddToCartForm";
import { ProductGallery } from "@/components/ProductGallery";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product || !product.active) notFound();

  const images = product.images?.split(",").filter(Boolean) ?? [];
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const effectivePrice = onSale ? product.salePrice! : product.price;
  const discountPct = onSale ? Math.round((1 - product.salePrice! / product.price) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-store-muted)]">
        <Link href="/" className="transition-colors hover:text-white">
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-white/80">{product.brand}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* GALLERY */}
        <ProductGallery
          images={images}
          videos={product.videos?.split(",").filter(Boolean) ?? []}
          alt={`${product.brand} ${product.model}`}
        />

        {/* INFO */}
        <div className="flex flex-col lg:pt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-store-muted)]">
            {product.brand}
          </p>
          <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">
            {product.model}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            {onSale ? (
              <>
                <span className="text-lg text-white/40 line-through">
                  {formatARS(product.price)}
                </span>
                <span className="text-3xl font-semibold text-[var(--color-lilac)]">
                  {formatARS(product.salePrice!)}
                </span>
                <span className="rounded-full bg-[var(--color-lilac-vivid)] px-2.5 py-1 text-xs font-bold text-white">
                  -{discountPct}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-medium text-white">{formatARS(product.price)}</span>
            )}
            <span className="w-full text-sm text-[var(--color-store-muted)]">
              o 3 cuotas sin interés
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-[var(--color-store-muted)]">
            {product.description}
          </p>

          <div className="my-7 h-px bg-white/10" />

          <AddToCartForm
            productId={product.id}
            brand={product.brand}
            model={product.model}
            price={effectivePrice}
            image={images[0] ?? null}
            variants={product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock }))}
          />

          <div className="mt-7 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: "🚚", label: "Envíos a todo el país" },
              { icon: "🔒", label: "Compra protegida" },
              { icon: "📦", label: "Stock real" },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="text-lg">{f.icon}</div>
                <p className="mt-1.5 text-[11px] leading-tight text-[var(--color-store-muted)]">
                  {f.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs leading-relaxed text-[var(--color-store-muted)]">
            Pagá online con Mercado Pago o coordiná transferencia, efectivo, link de tarjeta,
            Pago Fácil/Rapipago al finalizar tu compra.
          </p>
        </div>
      </div>
    </div>
  );
}
