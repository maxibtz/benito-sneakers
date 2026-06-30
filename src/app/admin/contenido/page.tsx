import { getHomeContent, getProducts } from "@/lib/dal";
import { HomeContentForm } from "@/components/forms/HomeContentForm";

export default async function ContenidoPage() {
  const [content, products] = await Promise.all([getHomeContent(), getProducts()]);
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Contenido de la home
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Editá cada bloque de tu página de inicio. Podés mostrar/ocultar y reordenar el contenido.
        </p>
      </div>

      <HomeContentForm content={content} brands={brands} />
    </div>
  );
}
