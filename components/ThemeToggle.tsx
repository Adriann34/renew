"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "renew-theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setIsDark(stored === "dark");
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="p-1.5 flex items-center justify-center text-ink-dim hover:text-ink transition-colors"
    >
      <span className="text-[13px] font-mono">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
