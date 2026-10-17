"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

import { ka } from "@/dictionaries/ka";
import { en } from "@/dictionaries/en";

type Language = "ka" | "en";

const dictionaries = {
  ka,
  en,
};

const LANGUAGE_CHANGE_EVENT = "blades-language-change";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof ka;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function subscribeToLanguage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
  };
}

function readLanguage(): Language {
  try {
    const saved = localStorage.getItem("language");

    if (saved === "ka" || saved === "en") {
      return saved;
    }
  } catch {
    // Storage can be unavailable. The server snapshot stays Georgian.
  }

  return "ka";
}

function getServerLanguageSnapshot(): Language {
  return "ka";
}

function setStoredLanguage(next: Language) {
  try {
    localStorage.setItem("language", next);
  } catch {
    // The document language still updates for this tab.
  }

  document.documentElement.lang = next;
  window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    readLanguage,
    getServerLanguageSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = language;

    try {
      const saved = localStorage.getItem("language");

      if (saved === language || saved === "ka" || saved === "en") {
        return;
      }

      localStorage.setItem("language", language);
    } catch {
      // Storage can be unavailable. The selected language still applies in this tab.
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: setStoredLanguage,
        t: dictionaries[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
