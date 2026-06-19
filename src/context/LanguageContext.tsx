"use client";

import { createContext, useContext, useEffect, useState, } from "react";

import { ka } from "@/dictionaries/ka";
import { en } from "@/dictionaries/en";

type Language = "ka" | "en";

const dictionaries = {
  ka,
  en,
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof ka;
};

const LanguageContext =
  createContext<LanguageContextType | null>(
    null
  );

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] =
    useState<Language>("ka");

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("language");

    if (
      savedLanguage === "ka" ||
      savedLanguage === "en"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "language",
      language
    );
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: dictionaries[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}