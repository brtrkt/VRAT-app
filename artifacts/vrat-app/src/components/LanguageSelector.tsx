import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_ORDER, LANGUAGE_META, type LangCode } from "@/data/translations";

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  function updateFades() {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftFade(scrollLeft > 4);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 4);
  }

  useEffect(() => {
    updateFades();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateFades, { passive: true });
    window.addEventListener("resize", updateFades);
    return () => {
      el.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", updateFades);
    };
  }, []);

  // Recompute when active language changes (button widths can shift slightly)
  useEffect(() => {
    const id = window.setTimeout(updateFades, 0);
    return () => window.clearTimeout(id);
  }, [lang]);

  // Auto-scroll the active chip into view so users always see their selection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [lang]);

  return (
    <div
      className="w-full mb-4 relative"
      role="toolbar"
      aria-label="Select language"
    >
      <div
        ref={scrollRef}
        className="language-scroll flex gap-2 overflow-x-auto pb-1"
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
              className="flex-shrink-0 flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 select-none"
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

      {/* Left fade — appears once user has scrolled right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-full transition-opacity duration-200"
        style={{
          width: 28,
          opacity: showLeftFade ? 1 : 0,
          background:
            "linear-gradient(to right, hsl(38 45% 96%) 0%, hsla(38, 45%, 96%, 0) 100%)",
        }}
      />

      {/* Right fade — visible whenever there is more content to scroll to */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full transition-opacity duration-200"
        style={{
          width: 28,
          opacity: showRightFade ? 1 : 0,
          background:
            "linear-gradient(to left, hsl(38 45% 96%) 0%, hsla(38, 45%, 96%, 0) 100%)",
        }}
      />

      <style>{`
        .language-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
