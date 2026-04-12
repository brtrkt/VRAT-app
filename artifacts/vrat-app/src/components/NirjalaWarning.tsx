import { useState } from "react";

const WARNING_TEXT =
  "Nirjala fasting means no food and no water for an extended period. This is the strictest form of fasting and carries real health risks including dehydration, low blood sugar, and dizziness. It is not recommended for pregnant women, diabetics, people with low blood pressure, children, or elderly individuals. If you are unsure whether this fast is safe for you, please consult your doctor first. Your health comes before your vrat — this is also dharma.";

interface Props {
  variant?: "light" | "dark";
}

export default function NirjalaWarning({ variant = "dark" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full transition-opacity active:opacity-70 ${
          variant === "light"
            ? "bg-white/20 text-white border border-white/40"
            : "bg-red-100 text-red-700 border border-red-200"
        }`}
        aria-label="Read nirjala fasting health note"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 7.5a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        Strict fast — read health note
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden"
            style={{ border: "1px solid rgba(220,38,38,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-1 flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-600" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-0.5">Nirjala Fasting — Health Note</h3>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Please read before fasting</p>
              </div>
            </div>
            <div className="px-5 pt-3 pb-5">
              <p className="text-sm text-foreground/80 leading-relaxed">
                {WARNING_TEXT}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="mt-5 w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity active:opacity-80"
                style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
