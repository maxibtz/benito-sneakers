"use client";

import { useEffect } from "react";

/**
 * Anima con fade+slide todas las <section> de la página a medida que entran
 * en pantalla. Se aplica por JS después de montar, así el contenido nunca
 * queda oculto sin JavaScript (SEO y accesibilidad intactos) y las secciones
 * ya visibles no parpadean.
 */
export function ScrollReveals() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    const below = sections.filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight * 0.85
    );
    if (below.length === 0) return;

    for (const el of below) el.classList.add("reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    for (const el of below) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}
