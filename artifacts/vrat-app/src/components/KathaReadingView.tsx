import { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import type { ChapteredKatha } from "@/data/kathas";
import { KATHA_CLOSING_MANTRAS, getKathaKey } from "@/data/kathas";

// ─── localStorage ─────────────────────────────────────────────────────────────
const KATHA_READ_KEY = "vrat_katha_read_v1";

function getReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(KATHA_READ_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function markKathaRead(kathaKey: string): void {
  const set = getReadSet();
  set.add(kathaKey);
  localStorage.setItem(KATHA_READ_KEY, JSON.stringify([...set]));
}

export function isKathaRead(kathaKey: string): boolean {
  return getReadSet().has(kathaKey);
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  vratId: string;
  vratName: string;
  katha: string | ChapteredKatha;
  onClose: () => void;
}

export default function KathaReadingView({ vratId, vratName, katha, onClose }: Props) {
  const kathaKey = getKathaKey(vratId);
  const isChaptered = typeof katha === "object" && "chapters" in katha;
  const closingMantra =
    (isChaptered ? (katha as ChapteredKatha).closingMantra : undefined) ??
    KATHA_CLOSING_MANTRAS[kathaKey] ??
    null;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [markedRead, setMarkedRead] = useState(() => isKathaRead(kathaKey));
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const max = scrollHeight - clientHeight;
    setScrollProgress(max > 0 ? Math.min(100, (scrollTop / max) * 100) : 100);
  }, []);

  function handleMarkRead() {
    markKathaRead(kathaKey);
    setMarkedRead(true);
  }

  function handleWhatsApp() {
    const story =
      typeof katha === "string"
        ? katha.slice(0, 280)
        : (katha as ChapteredKatha).chapters[0].body.slice(0, 280);
    const text = `📜 ${vratName} — Vrat Katha\n\n${story}...\n\n🙏 Read the full katha on the VRAT app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: "#FFFEF5" }}
      data-testid="katha-reading-view"
    >
      {/* Scroll progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${scrollProgress}%`,
            background: "linear-gradient(90deg, #D4A017, #E07B2A, #D4A017)",
          }}
        />
      </div>

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 pt-safe"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "0.75rem", borderBottom: "1px solid #D4A01725" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">📜</span>
          <p className="text-xs font-semibold tracking-wide" style={{ color: "#92400E" }}>
            Vrat Katha
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "#D4A01718" }}
          aria-label="Close"
          data-testid="close-katha-reading"
        >
          <X size={17} style={{ color: "#92400E" }} />
        </button>
      </div>

      {/* Scrollable body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="px-6 pt-6 pb-10 max-w-prose mx-auto">

          {/* Title */}
          <div className="text-center mb-6">
            <h2
              className="font-serif text-2xl font-bold leading-snug"
              style={{ color: "#78350F" }}
            >
              {vratName}
            </h2>
            <div className="w-12 h-0.5 mx-auto mt-3" style={{ background: "linear-gradient(90deg,#D4A017,#E07B2A,#D4A017)" }} />
          </div>

          {/* Katha content */}
          {isChaptered ? (
            <ChapteredKathaContent katha={katha as ChapteredKatha} />
          ) : (
            <SimpleKathaContent text={katha as string} />
          )}

          {/* Closing mantra */}
          {closingMantra && (
            <div
              className="mt-8 mb-2 text-center py-5 px-4 rounded-2xl"
              style={{ background: "#FFF8E7", border: "1px solid #D4A01740" }}
              data-testid="katha-closing-mantra"
            >
              <p
                className="text-xs tracking-widest uppercase mb-3"
                style={{ color: "#B45309", opacity: 0.6 }}
              >
                Closing Mantra
              </p>
              <p
                className="font-serif text-xl font-bold leading-relaxed whitespace-pre-line"
                style={{ color: "#92400E" }}
                lang="sa"
              >
                {closingMantra}
              </p>
            </div>
          )}

          {/* Family note */}
          <p
            className="text-xs text-center leading-relaxed mt-6 mb-8 italic"
            style={{ color: "#92400E80" }}
          >
            Your family's version of this story may differ — all versions are sacred.
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            {markedRead ? (
              <div
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-4"
                style={{ background: "#D4A01720", border: "1px solid #D4A01740" }}
                data-testid="katha-read-badge"
              >
                <span className="text-base" aria-hidden="true">🙏</span>
                <span className="text-sm font-semibold" style={{ color: "#92400E" }}>
                  Katha completed
                </span>
              </div>
            ) : (
              <button
                onClick={handleMarkRead}
                className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #D4A017 0%, #B45309 100%)",
                  color: "#FFFEF5",
                }}
                data-testid="mark-katha-read-btn"
              >
                Mark as read 🙏
              </button>
            )}

            <button
              onClick={handleWhatsApp}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: "#25D366",
                color: "#fff",
              }}
              data-testid="share-whatsapp-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Simple text katha ────────────────────────────────────────────────────────
function SimpleKathaContent({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-5">
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className="font-serif text-base leading-[1.9] text-justify"
          style={{ color: "#44260A", fontStyle: "italic" }}
        >
          {para}
        </p>
      ))}
    </div>
  );
}

// ─── Chaptered katha ──────────────────────────────────────────────────────────
function ChapteredKathaContent({ katha }: { katha: ChapteredKatha }) {
  return (
    <div className="space-y-7">
      {katha.chapters.map((chapter, i) => (
        <div key={i} data-testid={`katha-chapter-${i + 1}`}>
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: "#B45309" }}
          >
            {chapter.title}
          </p>
          <p
            className="font-serif text-base leading-[1.9] text-justify"
            style={{ color: "#44260A", fontStyle: "italic" }}
          >
            {chapter.body}
          </p>
          {i < katha.chapters.length - 1 && (
            <div className="mt-6 flex items-center gap-3" aria-hidden="true">
              <div className="flex-1 h-px" style={{ background: "#D4A01730" }} />
              <span style={{ color: "#D4A01780", fontSize: "11px" }}>✦</span>
              <div className="flex-1 h-px" style={{ background: "#D4A01730" }} />
            </div>
          )}
        </div>
      ))}

      {katha.phalaShruti && (
        <div
          className="mt-2 rounded-2xl px-5 py-5"
          style={{ background: "#FFF8E7", border: "1px solid #D4A01740" }}
          data-testid="katha-phala-shruti"
        >
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3 text-center"
            style={{ color: "#B45309" }}
          >
            Phala Shruti — The Blessings of this Katha
          </p>
          <p
            className="font-serif text-sm leading-[1.9] text-center"
            style={{ color: "#44260A", fontStyle: "italic" }}
          >
            {katha.phalaShruti}
          </p>
        </div>
      )}
    </div>
  );
}
