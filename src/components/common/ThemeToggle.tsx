"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { headerCircleControlClassName } from "@/components/common/LanguageSwitcher";

function subscribeToClientMount() {
  return () => {};
}

function getClientMounted() {
  return true;
}

function getServerMounted() {
  return false;
}

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribeToClientMount,
    getClientMounted,
    getServerMounted,
  );
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  if (!mounted) {
    return (
      <div
        className={`${headerCircleControlClassName} pointer-events-none`}
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={headerCircleControlClassName}
      aria-label={t.toggleTheme}
    >
      {theme === "dark" ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
    </button>
  );
}
