import { getVratKatha } from "@/data/kathas";
import type { ChapteredKatha } from "@/data/kathas";

export default function VratKathaSection({ vratId }: { vratId: string }) {
  const katha = getVratKatha(vratId);
  if (!katha) return null;

  const isChaptered = typeof katha === "object" && "chapters" in katha;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFEF5", border: "1.5px solid #D4A01750" }}
      data-testid="vrat-katha-section"
    >
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #D4A017, #E07B2A, #D4A017)" }} />

      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg" aria-hidden="true">📜</span>
          <h4 className="font-serif text-sm font-semibold" style={{ color: "#92400E" }}>
            The story behind this vrat
          </h4>
        </div>

        {isChaptered ? (
          <ChapteredKathaView katha={katha as ChapteredKatha} />
        ) : (
          <p
            className="font-serif text-sm leading-relaxed"
            style={{ color: "#44260A", fontStyle: "italic", lineHeight: "1.85" }}
          >
            {katha as string}
          </p>
        )}

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
  );
}

function ChapteredKathaView({ katha }: { katha: ChapteredKatha }) {
  return (
    <div className="space-y-4">
      {katha.chapters.map((chapter, i) => (
        <div key={i} data-testid={`katha-chapter-${i + 1}`}>
          <p
            className="font-serif text-xs font-semibold mb-1.5 tracking-wide"
            style={{ color: "#B45309" }}
          >
            {chapter.title}
          </p>
          <p
            className="font-serif text-sm leading-relaxed"
            style={{ color: "#44260A", fontStyle: "italic", lineHeight: "1.85" }}
          >
            {chapter.body}
          </p>
          {i < katha.chapters.length - 1 && (
            <div className="mt-3 flex items-center gap-2" aria-hidden="true">
              <div className="flex-1 h-px" style={{ background: "#D4A01730" }} />
              <span style={{ color: "#D4A01780", fontSize: "10px" }}>✦</span>
              <div className="flex-1 h-px" style={{ background: "#D4A01730" }} />
            </div>
          )}
        </div>
      ))}

      {katha.phalaShruti && (
        <div
          className="mt-2 pt-4 rounded-xl px-4 py-4"
          style={{ background: "#FFF8E7", border: "1px solid #D4A01740" }}
          data-testid="katha-phala-shruti"
        >
          <p
            className="font-serif text-xs font-semibold mb-2 tracking-wide text-center"
            style={{ color: "#B45309" }}
          >
            Phala Shruti — The Blessings of this Katha
          </p>
          <p
            className="font-serif text-sm leading-relaxed text-center"
            style={{ color: "#44260A", fontStyle: "italic", lineHeight: "1.9" }}
          >
            {katha.phalaShruti}
          </p>
        </div>
      )}
    </div>
  );
}
