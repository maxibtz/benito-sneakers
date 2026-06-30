import Link from "next/link";
import Image from "next/image";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

type ProductCardProps = {
  id: string;
  brand: string;
  model: string;
  price: number;
  salePrice?: number | null;
  image: string | null;
  totalStock: number;
};

export function ProductCard({
  id,
  brand,
  model,
  price,
  salePrice,
  image,
  totalStock,
}: ProductCardProps) {
  const lowStock = totalStock > 0 && totalStock <= 5;
  const outOfStock = totalStock === 0;
  const onSale = salePrice != null && salePrice < price;
  const discountPct = onSale ? Math.round((1 - salePrice! / price) * 100) : 0;

  return (
    <Link href={`/producto/${id}`} className="group flex flex-col">
      <div className="relative aspect-square w-full">
        {image ? (
          <Image
            src={image}
            alt={`${brand} ${model}`}
            fill
            className="shoe-blend object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-store-muted)]">
            Sin imagen
          </div>
        )}

        {onSale && (
          <span className="absolute right-1 top-1 rounded-full bg-[var(--color-lilac-vivid)] px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
            -{discountPct}%
          </span>
        )}
        {lowStock && (
          <span className="absolute left-1 top-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            Últimas {totalStock}
          </span>
        )}
        {outOfStock && (
          <span className="absolute left-1 top-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            Agotado
          </span>
        )}
      </div>

      <div className="mt-1 text-center">
        <p className="text-xs text-[var(--color-store-muted)]">{brand}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-white transition-colors group-hover:text-[var(--color-lilac)]">
          {model}
        </p>
        {onSale ? (
          <p className="mt-1 flex items-center justify-center gap-2 text-sm">
            <span className="text-white/40 line-through">{formatARS(price)}</span>
            <span className="font-semibold text-[var(--color-lilac)]">
              {formatARS(salePrice!)}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-white/85">{formatARS(price)}</p>
        )}
      </div>
    </Link>
  );
}
