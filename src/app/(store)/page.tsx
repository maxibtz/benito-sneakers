import Link from "next/link";
import Image from "next/image";
import { getActiveProductsForStore, getSiteSettings, getHomeContent } from "@/lib/dal";
import { CatalogGrid, type CatalogItem } from "@/components/CatalogGrid";
import { Marquee } from "@/components/Marquee";
import { ScrollReveals } from "@/components/ScrollReveals";
import { waLink } from "@/lib/whatsapp";

export default async function StoreHomePage() {
  const [products, settings, home] = await Promise.all([
    getActiveProductsForStore(),
    getSiteSettings(),
    getHomeContent(),
  ]);

  // ---- Hero (bloque 1) ----
  const chosen = settings.heroProductId
    ? products.find((p) => p.id === settings.heroProductId)
    : null;
  const featured = chosen ?? products[0];
  const featuredProductImage = featured?.images?.split(",").filter(Boolean)[0] ?? null;
  const featuredImage = settings.heroImage || featuredProductImage;
  const heroHref = featured ? `/producto/${featured.id}` : "#catalogo";
  const heroTitle = settings.heroTitle?.trim();
  const heroSubtitle = settings.heroSubtitle?.trim();
  const heroBadge = settings.heroBadge?.trim() || "Zapatillas alternativas";
  const heroCtaText = settings.heroCtaText?.trim() || "Ver catálogo";
  const heroCtaLink = settings.heroCtaLink?.trim() || "#catalogo";

  const faqWaLink = waLink(
    settings.whatsapp,
    settings.whatsappMessage || "¡Hola! Tengo una duda antes de comprar 👟"
  );

  const catalogItems: CatalogItem[] = products.map((product) => ({
    id: product.id,
    brand: product.brand,
    model: product.model,
    price: product.price,
    salePrice: product.salePrice,
    image: product.images?.split(",").filter(Boolean)[0] ?? null,
    totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
    section: product.section?.active ? product.section.name : null,
  }));

  // Imagen representativa por marca (para categorías)
  const brandImage = new Map<string, string>();
  for (const p of products) {
    const img = p.images?.split(",").filter(Boolean)[0];
    if (img && !brandImage.has(p.brand)) brandImage.set(p.brand, img);
  }

  return (
    <div className="flex flex-col">
      <ScrollReveals />
      <Marquee
        items={[
          "Envío a todo el país",
          "3 cuotas sin interés",
          "Stock real verificado",
          "Modelos alternativos",
        ]}
      />

      {/* 1 — HERO */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-6 pt-14 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--color-store-muted)]">
              {heroBadge}
            </span>
            <h1 className="font-display mt-5 text-balance text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl">
              {heroTitle ? (
                heroTitle
              ) : (
                <>
                  Tu próximo par,
                  <br />
                  <span className="text-[var(--color-lilac)]">flotando hacia vos.</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--color-store-muted)]">
              {heroSubtitle ||
                "Modelos únicos y pares contados. Diseño que se nota, sin gritar. Encontrá el tuyo antes de que se agote."}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href={heroCtaLink}
                className="btn-press btn-shine rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--color-store-bg)] hover:bg-white/90"
              >
                {heroCtaText}
              </Link>
              <span className="text-sm text-[var(--color-store-muted)]">
                {products.length} modelos disponibles
              </span>
            </div>
          </div>

          <div className="animate-fade-up">
            {featuredImage ? (
              <Link href={heroHref} className="group relative block aspect-square w-full">
                <Image
                  src={featuredImage}
                  alt={featured ? `${featured.brand} ${featured.model}` : "Benito Sneakers"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="shoe-blend object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  priority
                />
                {!settings.heroImage && featured && (
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    {featured.brand} {featured.model} →
                  </span>
                )}
              </Link>
            ) : (
              <div className="aspect-square w-full" />
            )}
          </div>
        </div>
      </section>

      {/* 2 — BENEFICIOS RÁPIDOS */}
      {home.toggles.benefits && home.benefits.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 lg:grid-cols-4">
            {home.benefits.map((b, i) => (
              <div key={i} className="bg-[var(--color-store-surface)] p-6">
                <div className="text-2xl">{b.icon}</div>
                <p className="mt-2 text-sm font-medium text-white">{b.title}</p>
                <p className="mt-1 text-sm text-[var(--color-store-muted)]">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3 — PRODUCTOS DESTACADOS */}
      {home.toggles.featured && (
        <section
          id="catalogo"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8 sm:py-16"
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-tight text-white">
                {home.featuredTitle}
              </h2>
              {home.featuredSubtitle && (
                <p className="mt-1 text-sm text-[var(--color-store-muted)]">{home.featuredSubtitle}</p>
              )}
            </div>
            <span className="hidden text-sm text-[var(--color-store-muted)] sm:block">
              {products.length} disponibles
            </span>
          </div>

          {products.length === 0 ? (
            <p className="py-16 text-center text-[var(--color-store-muted)]">
              Pronto vamos a tener productos cargados. ¡Volvé pronto!
            </p>
          ) : (
            <CatalogGrid products={catalogItems} />
          )}
        </section>
      )}

      {/* 4 — PROBLEMA → SOLUCIÓN */}
      {home.toggles.problemSol && home.psItems.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <SectionHeading title={home.psTitle} subtitle={home.psSubtitle} />
          <div className="grid gap-4 md:grid-cols-3">
            {home.psItems.map((it, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-6"
              >
                <p className="flex items-start gap-2 text-sm text-[var(--color-store-muted)] line-through decoration-red-400/60">
                  <span className="not-italic">😣</span> {it.problem}
                </p>
                <div className="my-3 h-px bg-white/10" />
                <p className="flex items-start gap-2 text-sm font-medium text-white">
                  <span className="text-[var(--color-lilac)]">✓</span> {it.solution}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5 — PRUEBA SOCIAL (TESTIMONIOS) */}
      {home.toggles.testimonials && home.testimonials.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <SectionHeading title={home.testimonialsTitle} subtitle={home.testimonialsSubtitle} />
          <div className="grid gap-4 md:grid-cols-3">
            {home.testimonials.map((t, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-store-surface)]"
              >
                {/* Foto o video real del cliente (unboxing / llegó la mercadería) */}
                {t.media &&
                  (t.mediaType === "video" ? (
                    <video
                      src={t.media}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-video w-full bg-black object-contain"
                    />
                  ) : (
                    <div className="relative aspect-video w-full">
                      <Image
                        src={t.media}
                        alt={`Compra de ${t.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 text-[var(--color-lilac)]">
                  {"★".repeat(Math.max(0, Math.min(5, Math.round(t.rating || 0))))}
                  <span className="text-white/20">
                    {"★".repeat(5 - Math.max(0, Math.min(5, Math.round(t.rating || 0))))}
                  </span>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-white/90">“{t.text}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-lilac-vivid)] text-sm font-bold text-white">
                    {(t.name || "?").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    {t.role && <p className="text-xs text-[var(--color-store-muted)]">{t.role}</p>}
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6 — CATEGORÍAS PRINCIPALES */}
      {home.toggles.categories && home.categories.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <SectionHeading title={home.categoriesTitle} subtitle={home.categoriesSubtitle} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {home.categories.map((c, i) => {
              const img = brandImage.get(c.brand) ?? null;
              return (
                <Link
                  key={i}
                  href="#catalogo"
                  className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-4"
                >
                  {img && (
                    <Image
                      src={img}
                      alt={c.label}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="relative rounded-full bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                    {c.label} →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 7 — DIFERENCIALES DE MARCA */}
      {home.toggles.differentials && home.differentials.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <SectionHeading title={home.differentialsTitle} subtitle={home.differentialsSubtitle} />
          <div className="grid gap-4 md:grid-cols-3">
            {home.differentials.map((d, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-6 text-center"
              >
                <div className="text-3xl">{d.icon}</div>
                <p className="mt-3 font-medium text-white">{d.title}</p>
                <p className="mt-1.5 text-sm text-[var(--color-store-muted)]">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8 — UGC / CONTENIDO REAL */}
      {home.toggles.ugc && home.ugcImages.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <SectionHeading title={home.ugcTitle} subtitle={home.ugcSubtitle} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {home.ugcImages.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src={img}
                  alt={`Contenido real ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9 — PREGUNTAS FRECUENTES */}
      {home.toggles.faq && home.faqs.length > 0 && (
        <section className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
          <SectionHeading title={home.faqTitle} subtitle={home.faqSubtitle} />
          <div className="flex flex-col gap-3">
            {home.faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-5"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-white marker:content-['']">
                  {f.q}
                  <span className="text-[var(--color-lilac)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-store-muted)]">{f.a}</p>
              </details>
            ))}
          </div>

          {faqWaLink && (
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-[var(--color-store-muted)]">
                ¿Tenés otra duda? Escribinos y la despejamos al toque.
              </p>
              <a
                href={faqWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 active:scale-[0.98]"
              >
                <WhatsAppIcon /> Consultar por WhatsApp
              </a>
            </div>
          )}
        </section>
      )}

      {/* 10 — CTA FINAL */}
      {home.toggles.finalCta && (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--color-lilac-vivid)]/20 to-transparent p-10 text-center sm:p-14">
            <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
              {home.finalCtaTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--color-store-muted)]">
              {home.finalCtaText}
            </p>
            <Link
              href={home.finalCtaLink || "#catalogo"}
              className="btn-press btn-shine mt-7 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[var(--color-store-bg)] hover:bg-white/90"
            >
              {home.finalCtaButton}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.477-.711zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
    </svg>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7 text-center">
      <h2 className="font-display text-3xl font-medium tracking-tight text-white">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--color-store-muted)]">{subtitle}</p>
      )}
    </div>
  );
}
