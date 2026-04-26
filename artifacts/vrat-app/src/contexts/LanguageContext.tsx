import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type LangCode, TRANSLATIONS } from "@/data/translations";

const LANG_KEY = "vrat_language_v1";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
  tArr: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as LangCode | null;
      if (saved && saved in TRANSLATIONS) return saved;
      const tradition = localStorage.getItem("vrat_tradition");
      if (tradition === "Sikh") return "pa";
    } catch {}
    return "en";
  });

  function setLang(code: LangCode) {
    setLangState(code);
    try { localStorage.setItem(LANG_KEY, code); } catch {}
  }

  function t(key: string): string {
    const val = TRANSLATIONS[lang]?.[key];
    if (val !== undefined && typeof val === "string") return val;
    const fallback = TRANSLATIONS["en"]?.[key];
    return typeof fallback === "string" ? fallback : key;
  }

  function tArr(key: string): string[] {
    const raw = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS["en"]?.[key] ?? "";
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") return raw.split(",");
    return [];
  }

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tArr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
