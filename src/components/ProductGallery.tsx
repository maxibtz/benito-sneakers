"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type MediaItem = { src: string; type: "image" | "video" };

export function ProductGallery({
  images,
  videos = [],
  alt,
}: {
  images: string[];
  videos?: string[];
  alt: string;
}) {
  // Fotos primero, videos después — la primera foto sigue siendo la portada.
  const media: MediaItem[] = [
    ...images.map((src) => ({ src, type: "image" as const })),
    ...videos.map((src) => ({ src, type: "video" as const })),
  ];

  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const hasMedia = media.length > 0;
  const multiple = media.length > 1;
  const current = media[active] ?? media[0];

  const go = useCallback(
    (dir: number) => {
      setZoom(false);
      setActive((i) => (i + dir + media.length) % media.length);
    },
    [media.length]
  );

  const close = useCallback(() => {
    setOpen(false);
    setZoom(false);
  }, []);

  // Teclado dentro del lightbox
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, close]);

  // Bloquear scroll del body cuando el lightbox está abierto
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  }

  if (!hasMedia) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-white/10 text-[var(--color-store-muted)]">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Visor principal */}
      <div className="group relative aspect-square w-full">
        {current.type === "video" ? (
          <video
            key={current.src}
            src={current.src}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full rounded-2xl object-contain"
          />
        ) : (
          <>
            <Image
              src={current.src}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="shoe-blend object-cover"
              priority
            />
            {/* Botón abrir lightbox (solo fotos) */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ampliar imagen"
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              🔍 Ampliar
            </button>
          </>
        )}

        {/* Flechas sobre el visor */}
        {multiple && (
          <>
            <ArrowButton side="left" onClick={() => go(-1)} />
            <ArrowButton side="right" onClick={() => go(1)} />
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
              {active + 1}/{media.length}
            </span>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {multiple && (
        <div className="flex flex-wrap gap-2">
          {media.map((m, i) => (
            <Thumb
              key={i}
              item={m}
              index={i}
              active={i === active}
              alt={alt}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}

      {/* Lightbox (solo fotos; los videos se reproducen en el visor) */}
      {open && current.type === "image" && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm text-white/70">
              {active + 1} / {media.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xl text-white transition hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {multiple && <ArrowButton side="left" onClick={() => go(-1)} large />}

            <div
              className={`relative h-full w-full max-w-4xl ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              onMouseMove={handleMove}
              onClick={() => setZoom((z) => !z)}
            >
              <Image
                src={current.src}
                alt={alt}
                fill
                sizes="100vw"
                className="object-contain transition-transform duration-200"
                style={{
                  transform: zoom ? "scale(2.2)" : "scale(1)",
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                }}
              />
            </div>

            {multiple && <ArrowButton side="right" onClick={() => go(1)} large />}
          </div>

          {multiple && (
            <div
              className="flex justify-center gap-2 overflow-x-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {media.map((m, i) => (
                <Thumb
                  key={i}
                  item={m}
                  index={i}
                  active={i === active}
                  alt={alt}
                  small
                  onClick={() => {
                    setZoom(false);
                    setActive(i);
                    // Si eligen un video desde el lightbox, lo cerramos para reproducirlo en el visor.
                    if (m.type === "video") close();
                  }}
                />
              ))}
            </div>
          )}

          <p className="pb-4 text-center text-xs text-white/50" onClick={(e) => e.stopPropagation()}>
            Tocá la imagen para hacer zoom · ← → para cambiar · Esc para cerrar
          </p>
        </div>
      )}
    </div>
  );
}

function Thumb({
  item,
  index,
  active,
  alt,
  small,
  onClick,
}: {
  item: MediaItem;
  index: number;
  active: boolean;
  alt: string;
  small?: boolean;
  onClick: () => void;
}) {
  const sizeCls = small ? "h-14 w-14" : "h-16 w-16";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.type === "video" ? `Ver video ${index + 1}` : `Ver imagen ${index + 1}`}
      className={`relative ${sizeCls} shrink-0 overflow-hidden rounded-lg border transition ${
        active ? "border-white" : "border-white/15 opacity-60 hover:opacity-100"
      }`}
    >
      {item.type === "video" ? (
        <>
          <video
            src={item.src}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 pl-0.5 text-[10px] text-black">
              ▶
            </span>
          </span>
        </>
      ) : (
        <Image
          src={item.src}
          alt={`${alt} ${index + 1}`}
          fill
          sizes={small ? "56px" : "64px"}
          className="object-cover"
        />
      )}
    </button>
  );
}

function ArrowButton({
  side,
  onClick,
  large,
}: {
  side: "left" | "right";
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={side === "left" ? "Anterior" : "Siguiente"}
      className={`absolute top-1/2 z-10 -translate-y-1/2 ${
        side === "left" ? "left-3" : "right-3"
      } flex items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 ${
        large ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
