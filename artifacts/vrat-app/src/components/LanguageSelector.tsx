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
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {LANGUAGE_ORDER.map((code: LangCode) => {
          const meta = LANGUAGE_META[code];
          const active = lang === code;
          return (
            <button
              key={code}
              onClick={() => setLang(code)}
              aria-pressed={active}
              aria-label={`${meta.name} — ${meta.native}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 select-none"
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
              <span aria-hidden="true" style={{ fontSize: "0.9rem", lineHeight: 1 }}>
                {meta.flag}
              </span>
              <span>{meta.native}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .language-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
