import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AlertCircle, X } from "lucide-react";
import { getUserTradition } from "@/hooks/useUserPrefs";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const ERROR_TYPE_OPTIONS = [
  { value: "wrong-date", label: "Wrong date" },
  { value: "missing-food", label: "Missing food" },
  { value: "wrong-mantra", label: "Wrong mantra" },
  { value: "app-not-loading", label: "App not loading" },
  { value: "other", label: "Other" },
] as const;

type ErrorType = (typeof ERROR_TYPE_OPTIONS)[number]["value"];

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/eat": "What to Eat",
  "/calendar": "Calendar",
  "/settings": "Settings",
  "/privacy": "Privacy",
  "/terms": "Terms",
  "/vrat-history": "Vrat History",
  "/how-to-install": "How to Install",
  "/recipes": "Recipes",
  "/langar-recipes": "Langar Recipes",
};

function pageLabelFor(path: string): string {
  return PAGE_LABELS[path] ?? path;
}

export default function ReportErrorButton() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>("wrong-date");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset form whenever the modal is closed
  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setErrorMsg("");
      setErrorType("wrong-date");
      setNotes("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/error-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorType,
          tradition: getUserTradition() ?? null,
          page: pageLabelFor(location),
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Server returned ${res.status}`);
      }
      setSubmitted(true);
      setTimeout(() => setOpen(false), 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send your report. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating trigger — small, unobtrusive, above bottom-nav */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-3 z-30 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide shadow-md transition-all active:scale-95 hover:shadow-lg"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)",
          background: "linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)",
          border: "1px solid rgba(224,123,42,0.35)",
          color: "#78350F",
        }}
        aria-label="Report an error"
        data-testid="report-error-btn"
      >
        <AlertCircle size={12} />
        <span>Report</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden"
            style={{ border: "1px solid rgba(224,123,42,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-6 pt-6 pb-4 relative"
              style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">🪔</span>
                <h2 className="font-serif text-lg font-bold text-foreground">Report an Error</h2>
              </div>
              <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">
                Help us improve VRAT — let us know what went wrong.
              </p>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(120,53,15,0.10)" }}
                aria-label="Close"
                data-testid="report-error-close"
              >
                <X size={14} style={{ color: "#78350F" }} />
              </button>
            </div>

            {/* Body */}
            {submitted ? (
              <div className="px-6 py-8 text-center">
                <div className="text-3xl mb-2" aria-hidden="true">🙏</div>
                <p className="text-sm font-semibold text-foreground">Thank you</p>
                <p className="text-xs text-foreground/70 mt-1">Your report has been sent.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="report-error-type" className="block text-xs font-semibold text-foreground/80">
                    What went wrong?
                  </label>
                  <select
                    id="report-error-type"
                    value={errorType}
                    onChange={(e) => setErrorType(e.target.value as ErrorType)}
                    className="w-full px-3 py-2 rounded-xl bg-white text-sm text-foreground focus:outline-none focus:ring-2"
                    style={{
                      border: "1px solid rgba(224,123,42,0.3)",
                    }}
                    data-testid="report-error-type"
                  >
                    {ERROR_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="report-error-notes" className="block text-xs font-semibold text-foreground/80">
                    Details <span className="text-foreground/50 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="report-error-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us more — date, festival, language, what you expected…"
                    rows={4}
                    maxLength={2000}
                    className="w-full px-3 py-2 rounded-xl bg-white text-sm text-foreground focus:outline-none focus:ring-2 resize-none"
                    style={{
                      border: "1px solid rgba(224,123,42,0.3)",
                    }}
                    data-testid="report-error-notes"
                  />
                </div>

                <div className="text-[11px] text-foreground/60 leading-relaxed">
                  Page: <span className="font-semibold">{pageLabelFor(location)}</span>
                  {getUserTradition() && (
                    <>
                      {" · "}Tradition: <span className="font-semibold">{getUserTradition()}</span>
                    </>
                  )}
                </div>

                {errorMsg && (
                  <div
                    className="text-xs px-3 py-2 rounded-lg"
                    style={{ background: "rgba(220,38,38,0.10)", color: "#991B1B" }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: "rgba(120,53,15,0.08)", color: "#78350F" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-sm font-bold tracking-wide text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #FF6F00 0%, #E65100 100%)" }}
                    data-testid="report-error-submit"
                  >
                    {submitting ? "Sending…" : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
