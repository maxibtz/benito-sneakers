// Lightweight dependency-free SVG charts for the admin dashboard.

function formatARSshort(value: number) {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value}`;
}

export function BarChart({
  data,
  height = 160,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const h = Math.round((d.value / max) * (height - 24));
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[9px] text-gray-400 dark:text-gray-500">
                {d.value > 0 ? formatARSshort(d.value) : ""}
              </span>
              <div
                className="w-full rounded-t-md bg-[var(--color-lilac-vivid)] transition-all"
                style={{ height: Math.max(2, h) }}
                title={`${d.label}: ${d.value}`}
              />
              <span className="text-[9px] text-gray-400 dark:text-gray-500">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = Math.max(1, segments.reduce((s, seg) => s + seg.value, 0));
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width="130" height="130" viewBox="0 0 130 130" className="shrink-0 -rotate-90">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="16" />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circ;
          const dash = `${len} ${circ - len}`;
          const el = (
            <circle
              key={i}
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="flex flex-col gap-2">
        <div>
          <p className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">{centerValue}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</p>
        </div>
        <ul className="flex flex-col gap-1">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: seg.color }} />
              {seg.label}: <span className="font-semibold">{seg.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
