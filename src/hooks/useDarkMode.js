import { useState, useEffect } from "react";

/**
 * Persists dark/light preference in localStorage.
 * Applies [data-theme="dark"] on <html> element so CSS variables swap.
 * Falls back to system preference on first visit.
 */
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return { dark, toggle };
}

export default useDarkMode;
