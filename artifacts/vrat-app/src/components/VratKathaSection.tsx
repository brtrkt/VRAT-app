import { getVratKatha } from "@/data/kathas";

export default function VratKathaSection({ vratId }: { vratId: string }) {
  const katha = getVratKatha(vratId);
  if (!katha) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFEF5", border: "1.5px solid #D4A01750" }}
      data-testid="vrat-katha-section"
    >
      {/* Warm gold top accent */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #D4A017, #E07B2A, #D4A017)" }} />

      <div className="px-5 pt-4 pb-5">
        {/* Heading */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg" aria-hidden="true">📜</span>
          <h4 className="font-serif text-sm font-semibold" style={{ color: "#92400E" }}>
            The story behind this vrat
          </h4>
        </div>

        {/* Katha text — serif, warm, storytelling */}
        <p
          className="font-serif text-sm leading-relaxed"
          style={{ color: "#44260A", fontStyle: "italic", lineHeight: "1.85" }}
        >
          {katha}
        </p>

        {/* Footer note */}
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
