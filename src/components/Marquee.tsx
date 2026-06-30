export function Marquee({ items }: { items: string[] }) {
  const sequence = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-white/10 py-2.5">
      <div className="flex w-max animate-marquee">
        {sequence.map((item, i) => (
          <div key={i} className="flex items-center" aria-hidden={i >= items.length}>
            <span className="whitespace-nowrap px-6 text-xs font-medium tracking-wide text-[var(--color-store-muted)]">
              {item}
            </span>
            <span className="text-white/20">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
