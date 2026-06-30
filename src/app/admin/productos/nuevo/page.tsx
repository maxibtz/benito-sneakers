import { createProductAction } from "@/actions/products";
import { ProductForm } from "@/components/forms/ProductForm";
import { getSections } from "@/lib/dal";

export default async function NewProductPage() {
  const sections = await getSections();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Cargar producto
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Marca, modelo, talles y stock</p>
      </div>
      <ProductForm
        action={createProductAction}
        sections={sections.map((s) => ({ id: s.id, name: s.name }))}
        submitLabel="Crear producto"
      />
    </div>
  );
}
