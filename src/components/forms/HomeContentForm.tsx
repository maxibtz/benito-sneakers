"use client";

import { useActionState, useState } from "react";
import { updateHomeContentAction, type SettingsState } from "@/actions/settings";
import type { HomeContentData } from "@/lib/dal";

const initial: SettingsState = {};

const inputClass =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--color-navy)] outline-none focus:border-[var(--color-navy)] dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-white";
const labelClass = "text-sm font-medium text-[var(--color-navy)] dark:text-gray-200";

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select";
  options?: { value: string; label: string }[];
};

function ListEditor<T extends Record<string, unknown>>({
  items,
  setItems,
  fields,
  empty,
  addLabel,
}: {
  items: T[];
  setItems: (v: T[]) => void;
  fields: FieldDef[];
  empty: T;
  addLabel: string;
}) {
  function update(i: number, key: string, value: unknown) {
    const next = items.slice();
    next[i] = { ...next[i], [key]: value };
    setItems(next);
  }
  function remove(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-black/10 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">#{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} className="rounded px-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Subir">↑</button>
              <button type="button" onClick={() => move(i, 1)} className="rounded px-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Bajar">↓</button>
              <button type="button" onClick={() => remove(i)} className="rounded px-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" aria-label="Eliminar">✕</button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <label className="mb-0.5 block text-xs text-gray-500 dark:text-gray-400">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={inputClass}
                  />
                ) : f.type === "select" ? (
                  <select
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={String(item[f.key] ?? "")}
                    onChange={(e) =>
                      update(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                    }
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems([...items, { ...empty }])}
        className="w-fit rounded-md border border-dashed border-[var(--color-navy)] px-3 py-1.5 text-sm font-medium text-[var(--color-navy)] hover:bg-[var(--color-lilac-light)] dark:border-[var(--color-lilac)] dark:text-[var(--color-lilac-light)] dark:hover:bg-[var(--color-lilac)]/10"
      >
        + {addLabel}
      </button>
    </div>
  );
}

function Block({
  n,
  title,
  desc,
  toggleName,
  toggleDefault,
  children,
}: {
  n: number;
  title: string;
  desc: string;
  toggleName?: string;
  toggleDefault?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-xs font-bold text-white dark:bg-[var(--color-lilac)]">
            {n}
          </span>
          <div>
            <h2 className="font-semibold text-[var(--color-navy)] dark:text-white">{title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
          </div>
        </div>
        {toggleName && (
          <label className="flex shrink-0 items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <input type="checkbox" name={toggleName} defaultChecked={toggleDefault} className="h-4 w-4" />
            Mostrar
          </label>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function TitleFields({
  titleName,
  titleDefault,
  subtitleName,
  subtitleDefault,
}: {
  titleName: string;
  titleDefault: string;
  subtitleName: string;
  subtitleDefault: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={labelClass}>Título de la sección</label>
        <input name={titleName} defaultValue={titleDefault} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Subtítulo (opcional)</label>
        <input name={subtitleName} defaultValue={subtitleDefault} className={inputClass} />
      </div>
    </div>
  );
}

export function HomeContentForm({
  content,
  brands,
}: {
  content: HomeContentData;
  brands: string[];
}) {
  const [state, action, pending] = useActionState(updateHomeContentAction, initial);

  const [benefits, setBenefits] = useState(content.benefits);
  const [psItems, setPsItems] = useState(content.psItems);
  const [testimonials, setTestimonials] = useState(content.testimonials);
  const [categories, setCategories] = useState(content.categories);
  const [differentials, setDifferentials] = useState(content.differentials);
  const [faqs, setFaqs] = useState(content.faqs);
  const [ugc, setUgc] = useState<string[]>(content.ugcImages);

  const brandOptions = brands.map((b) => ({ value: b, label: b }));

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Hidden JSON inputs sincronizados con el estado */}
      <input type="hidden" name="benefits" value={JSON.stringify(benefits)} />
      <input type="hidden" name="psItems" value={JSON.stringify(psItems)} />
      <input type="hidden" name="testimonials" value={JSON.stringify(testimonials)} />
      <input type="hidden" name="categories" value={JSON.stringify(categories)} />
      <input type="hidden" name="differentials" value={JSON.stringify(differentials)} />
      <input type="hidden" name="faqs" value={JSON.stringify(faqs)} />
      <input type="hidden" name="ugcImages" value={ugc.join(",")} />

      <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between rounded-xl border border-black/10 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0e1023]/90">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Editá cada bloque de tu home. El bloque 1 (Hero) se edita en <strong>Ajustes</strong>.
        </p>
        <div className="flex items-center gap-3">
          {state.ok && <span className="text-sm text-green-600 dark:text-green-400">✓ Guardado</span>}
          {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[var(--color-navy)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Guardar todo"}
          </button>
        </div>
      </div>

      {/* 2 — Beneficios rápidos */}
      <Block n={2} title="Beneficios rápidos" desc="Íconos con los beneficios que generan confianza." toggleName="showBenefits" toggleDefault={content.toggles.benefits}>
        <div>
          <label className={labelClass}>Título de la sección</label>
          <input name="benefitsTitle" defaultValue={content.benefitsTitle} className={inputClass} />
        </div>
        <ListEditor
          items={benefits}
          setItems={setBenefits}
          fields={[
            { key: "icon", label: "Ícono (emoji)" },
            { key: "title", label: "Título" },
            { key: "desc", label: "Descripción", type: "textarea" },
          ]}
          empty={{ icon: "✨", title: "", desc: "" }}
          addLabel="Agregar beneficio"
        />
      </Block>

      {/* 3 — Productos destacados */}
      <Block n={3} title="Productos destacados" desc="Mostrá tus productos estrella (el catálogo se arma solo)." toggleName="showFeatured" toggleDefault={content.toggles.featured}>
        <TitleFields titleName="featuredTitle" titleDefault={content.featuredTitle} subtitleName="featuredSubtitle" subtitleDefault={content.featuredSubtitle} />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Los productos que se muestran son los que tengas activos. Para destacar uno en la portada,
          usá el bloque Hero en Ajustes.
        </p>
      </Block>

      {/* 4 — Problema → Solución */}
      <Block n={4} title="Problema → Solución" desc="Conectá con el dolor de tu cliente y mostrá la solución." toggleName="showProblemSol" toggleDefault={content.toggles.problemSol}>
        <TitleFields titleName="psTitle" titleDefault={content.psTitle} subtitleName="psSubtitle" subtitleDefault={content.psSubtitle} />
        <ListEditor
          items={psItems}
          setItems={setPsItems}
          fields={[
            { key: "problem", label: "Problema", type: "textarea" },
            { key: "solution", label: "Solución", type: "textarea" },
          ]}
          empty={{ problem: "", solution: "" }}
          addLabel="Agregar par problema/solución"
        />
      </Block>

      {/* 5 — Prueba social */}
      <Block n={5} title="Prueba social (testimonios)" desc="Reseñas y opiniones reales que generan confianza." toggleName="showTestimonials" toggleDefault={content.toggles.testimonials}>
        <TitleFields titleName="testimonialsTitle" titleDefault={content.testimonialsTitle} subtitleName="testimonialsSubtitle" subtitleDefault={content.testimonialsSubtitle} />
        <ListEditor
          items={testimonials}
          setItems={setTestimonials}
          fields={[
            { key: "name", label: "Nombre" },
            { key: "role", label: "Detalle (ej: Compró Nike Jordan)" },
            { key: "rating", label: "Estrellas (1-5)", type: "number" },
            { key: "text", label: "Testimonio", type: "textarea" },
          ]}
          empty={{ name: "", role: "", rating: 5, text: "" }}
          addLabel="Agregar testimonio"
        />
      </Block>

      {/* 6 — Categorías */}
      <Block n={6} title="Categorías principales" desc="Facilitá la navegación por marca." toggleName="showCategories" toggleDefault={content.toggles.categories}>
        <TitleFields titleName="categoriesTitle" titleDefault={content.categoriesTitle} subtitleName="categoriesSubtitle" subtitleDefault={content.categoriesSubtitle} />
        <ListEditor
          items={categories}
          setItems={setCategories}
          fields={[
            { key: "label", label: "Texto a mostrar" },
            { key: "brand", label: "Marca (filtra el catálogo)", type: "select", options: brandOptions },
          ]}
          empty={{ label: "", brand: "" }}
          addLabel="Agregar categoría"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          La imagen de cada categoría se toma automáticamente de un producto de esa marca.
        </p>
      </Block>

      {/* 7 — Diferenciales */}
      <Block n={7} title="Diferenciales de marca" desc="Por qué sos la mejor opción del mercado." toggleName="showDifferentials" toggleDefault={content.toggles.differentials}>
        <TitleFields titleName="differentialsTitle" titleDefault={content.differentialsTitle} subtitleName="differentialsSubtitle" subtitleDefault={content.differentialsSubtitle} />
        <ListEditor
          items={differentials}
          setItems={setDifferentials}
          fields={[
            { key: "icon", label: "Ícono (emoji)" },
            { key: "title", label: "Título" },
            { key: "desc", label: "Descripción", type: "textarea" },
          ]}
          empty={{ icon: "⭐", title: "", desc: "" }}
          addLabel="Agregar diferencial"
        />
      </Block>

      {/* 8 — UGC */}
      <Block n={8} title="UGC / contenido real" desc="Fotos reales de tus productos en uso / clientes." toggleName="showUgc" toggleDefault={content.toggles.ugc}>
        <TitleFields titleName="ugcTitle" titleDefault={content.ugcTitle} subtitleName="ugcSubtitle" subtitleDefault={content.ugcSubtitle} />
        {ugc.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ugc.map((img, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`UGC ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setUgc(ugc.filter((_, idx) => idx !== i))}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  aria-label="Quitar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <div>
          <label className={labelClass}>Agregar fotos</label>
          <input type="file" name="ugcFiles" accept="image/*" multiple className={inputClass} />
        </div>
      </Block>

      {/* 9 — FAQ */}
      <Block n={9} title="Preguntas frecuentes" desc="Respondé dudas y eliminá objeciones." toggleName="showFaq" toggleDefault={content.toggles.faq}>
        <TitleFields titleName="faqTitle" titleDefault={content.faqTitle} subtitleName="faqSubtitle" subtitleDefault={content.faqSubtitle} />
        <ListEditor
          items={faqs}
          setItems={setFaqs}
          fields={[
            { key: "q", label: "Pregunta" },
            { key: "a", label: "Respuesta", type: "textarea" },
          ]}
          empty={{ q: "", a: "" }}
          addLabel="Agregar pregunta"
        />
      </Block>

      {/* 10 — CTA final */}
      <Block n={10} title="CTA final" desc="Cerrá con una llamada a la acción clara." toggleName="showFinalCta" toggleDefault={content.toggles.finalCta}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Título</label>
            <input name="finalCtaTitle" defaultValue={content.finalCtaTitle} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Texto</label>
            <input name="finalCtaText" defaultValue={content.finalCtaText} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Texto del botón</label>
            <input name="finalCtaButton" defaultValue={content.finalCtaButton} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Link del botón</label>
            <input name="finalCtaLink" defaultValue={content.finalCtaLink} className={inputClass} />
          </div>
        </div>
      </Block>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-navy)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar todo"}
        </button>
      </div>
    </form>
  );
}
