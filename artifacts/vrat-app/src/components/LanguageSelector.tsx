import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_ORDER, LANGUAGE_META, type LangCode } from "@/data/translations";

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className="w-full mb-4"
      role="toolbar"
      aria-label="Select language"
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {LANGUAGE_ORDER.map((code: LangCode) => {
          const meta = LANGUAGE_META[code];
          const active = lang === code;
          return (
            <button
              key={code}
              onClick={() => setLang(code)}
              aria-pressed={active}
              aria-label={`${meta.name} — ${meta.native}`}
              className="flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 select-none"
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #FF6F00 0%, #E65100 100%)",
                      color: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(255,111,0,0.35)",
                      border: "1.5px solid transparent",
                    }
                  : {
                      background: "rgba(255,111,0,0.07)",
                      color: "#B45309",
                      border: "1.5px solid rgba(255,111,0,0.20)",
                    }
              }
            >
              <span>{meta.native}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
