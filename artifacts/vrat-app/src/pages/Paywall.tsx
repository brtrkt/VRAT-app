import { useState } from "react";

function DiyaFlame() {
  return (
    <svg viewBox="0 0 80 100" className="w-16 h-20 mx-auto" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="pw-glow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pw-flame" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F97316" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="60" rx="35" ry="35" fill="url(#pw-glow)" />
      <path d="M40 10 C33 22 30 38 37 48 C38.5 51 40 52 40 52 C40 52 41.5 51 43 48 C50 38 47 22 40 10Z" fill="url(#pw-flame)" />
      <path d="M40 22 C36 31 35 42 38 48 C39 50 40 51 40 51 C40 51 41 50 42 48 C45 42 44 31 40 22Z" fill="#FFFDE7" opacity="0.85" />
      <path d="M40 52 C43 56 47 61 51 63" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 72 Q20 86 40 88 Q60 86 62 72 Q60 66 40 64 Q20 66 18 72Z" fill="#C2410C" />
      <path d="M56 66 Q63 62 68 64 Q69 70 62 72 Q59 70 56 66Z" fill="#9A3412" />
      <ellipse cx="40" cy="72" rx="14" ry="4" fill="#92400E" opacity="0.5" />
      <circle cx="30" cy="80" r="1.5" fill="#FCD34D" opacity="0.6" />
      <circle cx="40" cy="83" r="1.5" fill="#FCD34D" opacity="0.6" />
      <circle cx="50" cy="80" r="1.5" fill="#FCD34D" opacity="0.6" />
    </svg>
  );
}

type Plan = "monthly" | "annual";

export default function Paywall() {
  const [tapped, setTapped] = useState<Plan | null>(null);

  function handlePlan(plan: Plan) {
    setTapped(plan);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(160deg, #C86B1A 0%, #E07B2A 50%, #D97706 100%)" }}
    >
      <div className="w-full max-w-sm">
        <DiyaFlame />

        <div className="text-center mt-6 mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#FDE68A" }}>
            Free trial ended
          </p>
          <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: "#FEF9EC" }}>
            VRAT
          </h1>
          <p className="text-lg font-serif mb-5" style={{ color: "#FDE68A" }}>
            Your Fast, Your Way.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#FEF3E2", opacity: 0.9 }}>
            Continue for $2.99/month or $19.99/year{" "}
            <span
              className="font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.2)", color: "#FEF9EC" }}
            >
              save 44%
            </span>
            . Your vrat companion, always with you.
          </p>
        </div>

        {tapped ? (
          <div
            className="rounded-2xl px-6 py-5 text-center mb-4"
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}
          >
            <p className="text-base font-semibold mb-1" style={{ color: "#FEF9EC" }}>
              ✓ You're on the list!
            </p>
            <p className="text-sm" style={{ color: "#FEF3E2", opacity: 0.85 }}>
              Payments are coming soon. We'll notify you the moment{" "}
              {tapped === "monthly" ? "the monthly plan" : "the annual plan"} is available.
            </p>
            <button
              onClick={() => setTapped(null)}
              className="mt-4 text-xs underline underline-offset-2 opacity-70 transition-opacity active:opacity-50"
              style={{ color: "#FEF3E2" }}
            >
              Back to plans
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handlePlan("annual")}
              className="w-full py-4 rounded-2xl font-semibold text-base tracking-wide transition-all active:scale-98"
              style={{ background: "#FEF9EC", color: "#C86B1A" }}
              data-testid="paywall-annual"
            >
              Annual — $19.99 / year
              <span
                className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ background: "#E07B2A", color: "white" }}
              >
                BEST VALUE
              </span>
            </button>

            <button
              onClick={() => handlePlan("monthly")}
              className="w-full py-4 rounded-2xl font-semibold text-base tracking-wide transition-all active:scale-98"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#FEF9EC",
                border: "1.5px solid rgba(255,255,255,0.4)",
              }}
              data-testid="paywall-monthly"
            >
              Monthly — $2.99 / month
            </button>
          </div>
        )}

        <p className="text-center text-xs mt-6" style={{ color: "#FEF3E2", opacity: 0.6 }}>
          Full access · Cancel anytime · No ads
        </p>
      </div>
    </div>
  );
}
