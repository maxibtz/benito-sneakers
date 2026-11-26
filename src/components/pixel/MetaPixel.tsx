"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { loadMetaPixel, trackPixel } from "@/lib/meta-pixel";

/** Carga el Píxel de Meta y registra una visita (PageView) en cada cambio de página. */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";

  useEffect(() => {
    loadMetaPixel(pixelId);
  }, [pixelId]);

  useEffect(() => {
    loadMetaPixel(pixelId);
    trackPixel("PageView");
  }, [pixelId, pathname, search]);

  return null;
}
