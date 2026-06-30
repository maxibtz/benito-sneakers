import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/dal";
import { deleteProductAction, toggleProductActiveAction } from "@/actions/products";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">Productos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {products.length} productos cargados
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-md bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)]"
        >
          + Cargar producto
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Imagen</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Costo / Ganancia</th>
              <th className="px-4 py-3">Stock total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {products.map((product) => {
              const firstImage = product.images?.split(",").filter(Boolean)[0];
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              const cost = product.cost ?? 0;
              const effectivePrice =
                product.salePrice && product.salePrice < product.price
                  ? product.salePrice
                  : product.price;
              const profit = cost > 0 ? effectivePrice - cost : null;
              const marginPct =
                profit != null && effectivePrice > 0
                  ? Math.round((profit / effectivePrice) * 100)
                  : null;
              return (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={product.model}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-white/10" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-navy)] dark:text-white">
                      {product.brand} {product.model}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                  </td>
                  <td className="px-4 py-3">{product.sku}</td>
                  <td className="px-4 py-3">
                    {product.salePrice ? (
                      <span className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">
                          {formatARS(product.price)}
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatARS(product.salePrice)}
                        </span>
                      </span>
                    ) : (
                      formatARS(product.price)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {cost > 0 ? (
                      <span className="flex flex-col">
                        <span className="text-xs text-gray-400">costo {formatARS(cost)}</span>
                        <span
                          className={`font-semibold ${
                            (profit ?? 0) >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          +{formatARS(profit ?? 0)}
                          {marginPct != null && (
                            <span className="ml-1 text-xs font-normal text-gray-400">
                              ({marginPct}%)
                            </span>
                          )}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">sin costo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{totalStock}</td>
                  <td className="px-4 py-3">
                    <form
                      action={toggleProductActiveAction.bind(null, product.id, !product.active)}
                    >
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.active
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                        }`}
                      >
                        {product.active ? "Activo" : "Oculto"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="text-sm font-medium text-[var(--color-navy)] hover:underline dark:text-[var(--color-lilac-light)]"
                      >
                        Editar
                      </Link>
                      <form action={deleteProductAction.bind(null, product.id)}>
                        <button
                          type="submit"
                          className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no cargaste productos.
          </p>
        )}
      </div>
    </div>
  );
}
