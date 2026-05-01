import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_ORDER, LANGUAGE_META, type LangCode } from "@/data/translations";

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentMeta = LANGUAGE_META[lang];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function pick(code: LangCode) {
    setLang(code);
    setOpen(false);
  }

  return (
    <div className="w-full mb-4 flex justify-center">
      <div ref={wrapperRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Language: ${currentMeta.name}. Tap to change.`}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 select-none"
          style={{
            background: "linear-gradient(135deg, #FF6F00 0%, #E65100 100%)",
            color: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(255,111,0,0.35)",
            border: "1.5px solid transparent",
            minWidth: 140,
            justifyContent: "space-between",
          }}
        >
          <span>{currentMeta.native}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transition: "transform 200ms ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
            aria-hidden="true"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            aria-label="Languages"
            className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 overflow-hidden"
            style={{
              minWidth: 180,
              background: "#FFFFFF",
              borderRadius: 14,
              border: "1.5px solid rgba(255,111,0,0.20)",
              boxShadow: "0 10px 30px rgba(180, 83, 9, 0.18), 0 2px 8px rgba(255,111,0,0.10)",
            }}
          >
            {LANGUAGE_ORDER.map((code: LangCode) => {
              const meta = LANGUAGE_META[code];
              const active = lang === code;
              return (
                <li key={code} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => pick(code)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors duration-150"
                    style={{
                      background: active ? "rgba(255,111,0,0.10)" : "transparent",
                      color: active ? "#E65100" : "#7C3A00",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,111,0,0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <span>{meta.native}</span>
                    {active && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 10.5L8.5 14L15 7"
                          stroke="#E65100"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
