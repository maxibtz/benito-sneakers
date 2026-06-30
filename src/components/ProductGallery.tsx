"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const hasImages = images.length > 0;
  const multiple = images.length > 1;

  const go = useCallback(
    (dir: number) => {
      setZoom(false);
      setActive((i) => (i + dir + images.length) % images.length);
    },
    [images.length]
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

  if (!hasImages) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-white/10 text-[var(--color-store-muted)]">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen principal */}
      <div className="group relative aspect-square w-full">
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="shoe-blend object-cover"
          priority
        />

        {/* Botón abrir lightbox */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ampliar imagen"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          🔍 Ampliar
        </button>

        {/* Flechas sobre la imagen principal */}
        {multiple && (
          <>
            <ArrowButton side="left" onClick={() => go(-1)} />
            <ArrowButton side="right" onClick={() => go(1)} />
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
              {active + 1}/{images.length}
            </span>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {multiple && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border transition ${
                i === active
                  ? "border-white"
                  : "border-white/15 opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          {/* Barra superior */}
          <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm text-white/70">
              {active + 1} / {images.length}
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

          {/* Imagen ampliada con zoom */}
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
                src={images[active]}
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

          {/* Miniaturas en el lightbox */}
          {multiple && (
            <div
              className="flex justify-center gap-2 overflow-x-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setZoom(false);
                    setActive(i);
                  }}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition ${
                    i === active ? "border-white" : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`${alt} ${i + 1}`} fill sizes="56px" className="object-cover" />
                </button>
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
