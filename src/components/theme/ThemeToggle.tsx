"use client";

import { useEffect, useState } from "react";

type Tone = "onDark" | "onLight";

export function ThemeToggle({
  storageKey,
  tone = "onDark",
  className = "",
}: {
  storageKey: string;
  tone?: Tone;
  className?: string;
}) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(storageKey, next ? "dark" : "light");
  }

  const track =
    tone === "onDark"
      ? "border-white/20 bg-white/10 hover:bg-white/20"
      : "border-black/10 bg-black/5 hover:bg-black/10 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20";

  if (!mounted) {
    return (
      <div
        className={`h-9 w-16 rounded-full border ${
          tone === "onDark" ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5"
        } ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Cambiar entre modo claro y oscuro"
      className={`relative flex h-9 w-16 items-center rounded-full border px-1 transition-colors ${track} ${className}`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-lilac)] text-sm shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
