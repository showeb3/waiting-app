import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, getBrowserLanguage, getTranslation } from "@shared/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Determine storage key based on current path
function getStorageKey(): string {
  if (typeof window === "undefined") return "language";

  const path = window.location.pathname;

  if (path.startsWith("/admin")) return "language-admin";
  if (path.startsWith("/kiosk")) return "language-kiosk";
  if (path.startsWith("/store") || path.startsWith("/ticket")) return "language-guest";

  return "language";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage first
    if (typeof window !== "undefined") {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (saved === "ja" || saved === "en") {
        return saved;
      }
    }
    // Fall back to browser language
    return getBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, lang);
    }
  };

  const t = (key: string) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
