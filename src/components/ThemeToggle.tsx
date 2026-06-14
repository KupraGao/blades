"use client";

import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
} from "lucide-react";

export function ThemeToggle() {
  const {
    theme,
    setTheme,
  } = useTheme();

  return (
    <button
      onClick={() =>
        setTheme(
          theme === "dark"
            ? "light"
            : "dark"
        )
      }
      className="
        flex
        items-center
        justify-center
        w-10
        h-10
        rounded-full
        border
        border-zinc-700
        hover:bg-zinc-800
        transition
      "
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}