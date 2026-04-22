import { useState } from "react";
import { getVratKatha } from "@/data/kathas";
import type { ChapteredKatha } from "@/data/kathas";
import KathaReadingView from "@/components/KathaReadingView";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VratKathaSection({
  vratId,
  vratName = "this vrat",
}: {
  vratId: string;
  vratName?: string;
}) {
  const { t } = useLanguage();
  const katha = getVratKatha(vratId);
  const [showReader, setShowReader] = useState(false);
  if (!katha) return null;

  const isChaptered = typeof katha === "object" && "chapters" in katha;

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FFFEF5", border: "1.5px solid #D4A01750" }}
        data-testid="vrat-katha-section"
      >
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #D4A017, #E07B2A, #D4A017)" }} />

        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">📜</span>
              <h4 className="font-serif text-sm font-semibold" style={{ color: "#92400E" }}>
                The story behind this vrat
              </h4>
            </div>
          </div>

          {/* Inline preview — first ~200 chars */}
          {isChaptered ? (
            <ChapteredKathaPreview katha={katha as ChapteredKatha} />
          ) : (
            <p
              className="font-serif text-sm leading-relaxed"
              style={{ color: "#44260A", fontStyle: "italic", lineHeight: "1.85" }}
            >
              {(katha as string).slice(0, 220).trimEnd()}
              {(katha as string).length > 220 ? "…" : ""}
            </p>
          )}

          {/* Read full katha button */}
          <button
            onClick={() => setShowReader(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #D4A017 0%, #B45309 100%)",
              color: "#FFFEF5",
            }}
            data-testid="read-katha-btn"
          >
            <span aria-hidden="true">📖</span>
            {t("katha.read")}
          </button>

          <p
            className="text-xs leading-relaxed mt-4 pt-3"
            style={{
              color: "#92400E99",
              fontStyle: "italic",
              borderTop: "1px solid #D4A01730",
            }}
          >
            Your family's version of this story may differ — all versions are sacred.
          </p>
        </div>
      </div>

      {showReader && (
        <KathaReadingView
          vratId={vratId}
          vratName={vratName}
          katha={katha}
          onClose={() => setShowReader(false)}
        />
      )}
    </>
  );
}

function ChapteredKathaPreview({ katha }: { katha: ChapteredKatha }) {
  const firstChapter = katha.chapters[0];
  return (
    <div>
      <p
        className="font-serif text-xs font-semibold mb-1.5 tracking-wide"
        style={{ color: "#B45309" }}
      >
        {firstChapter.title}
      </p>
      <p
        className="font-serif text-sm leading-relaxed"
        style={{ color: "#44260A", fontStyle: "italic", lineHeight: "1.85" }}
      >
        {firstChapter.body.slice(0, 200).trimEnd()}
        {firstChapter.body.length > 200 ? "…" : ""}
      </p>
      {katha.chapters.length > 1 && (
        <p className="text-xs mt-2" style={{ color: "#B4530980" }}>
          + {katha.chapters.length - 1} more chapters
        </p>
      )}
    </div>
  );
}
