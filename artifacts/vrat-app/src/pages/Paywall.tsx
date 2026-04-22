import { useState } from "react";
import { getUserEmail, setUserEmail, setSubscribed } from "@/hooks/useUserPrefs";

const STRIPE_MONTHLY_URL = "https://buy.stripe.com/placeholder_monthly";
const STRIPE_ANNUAL_URL  = "https://buy.stripe.com/placeholder_annual";

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

function EmailStep({ onContinue }: { onContinue: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleContinue() {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setUserEmail(trimmed);
    onContinue();
  }

  return (
    <div className="w-full max-w-sm">
      <DiyaFlame />

      <div className="text-center mt-6 mb-8">
        <h1 className="font-serif text-3xl font-bold mb-3" style={{ color: "#FEF9EC" }}>
          VRAT
        </h1>
        <p className="text-base font-serif leading-relaxed" style={{ color: "#FDE68A" }}>
          Enter your email to continue
        </p>
        <p
          className="text-sm mt-3 leading-relaxed px-2"
          style={{ color: "#FEF3E2", opacity: 0.85 }}
        >
          We'll notify you of new vrat guides, kathas, and features.
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="your@email.com"
          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.18)",
            border: error ? "1.5px solid #FCA5A5" : "1.5px solid rgba(255,255,255,0.35)",
            color: "#FEF9EC",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          data-testid="email-input"
          autoComplete="email"
          inputMode="email"
        />
        {error && (
          <p className="text-xs px-1" style={{ color: "#FCA5A5" }}>{error}</p>
        )}
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl font-semibold text-base tracking-wide transition-all active:scale-[0.98]"
          style={{ background: "#FEF9EC", color: "#C86B1A" }}
          data-testid="email-continue-btn"
        >
          Continue →
        </button>
      </div>

      <p className="text-center text-xs mt-5" style={{ color: "#FEF3E2", opacity: 0.55 }}>
        No spam, ever. Unsubscribe anytime.
      </p>
    </div>
  );
}

type Plan = "monthly" | "annual";

function SubscriptionStep() {
  const [selected, setSelected] = useState<Plan>("annual");

  function handleSubscribe() {
    const url = selected === "annual" ? STRIPE_ANNUAL_URL : STRIPE_MONTHLY_URL;
    window.open(url, "_blank", "noopener");
  }

  function handleRestore() {
    const code = window.prompt("Enter your subscription confirmation code:");
    if (code && code.trim().length > 0) {
      setSubscribed();
      window.location.reload();
    }
  }

  return (
    <div className="w-full max-w-sm">
      <DiyaFlame />

      <div className="text-center mt-5 mb-7">
        <h1
          className="font-serif text-2xl font-bold leading-snug mb-2"
          style={{ color: "#FEF9EC" }}
          data-testid="paywall-heading"
        >
          Your free trial has ended 🙏
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "#FDE68A" }}>
          Continue your vrat journey with{" "}
          <span className="font-semibold">VRAT Premium</span>
        </p>
      </div>

      <div className="space-y-3 mb-5">
        <button
          onClick={() => setSelected("annual")}
          className="w-full rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98] relative"
          style={{
            background: selected === "annual" ? "#FEF9EC" : "rgba(255,255,255,0.12)",
            border: selected === "annual"
              ? "2px solid #FEF9EC"
              : "1.5px solid rgba(255,255,255,0.3)",
            color: selected === "annual" ? "#C86B1A" : "#FEF9EC",
          }}
          data-testid="plan-annual"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-base">Yearly</p>
              <p
                className="text-sm mt-0.5"
                style={{ color: selected === "annual" ? "#9A3412" : "#FDE68Acc" }}
              >
                $19.99 / year
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: selected === "annual" ? "#E07B2A" : "rgba(255,255,255,0.2)",
                  color: selected === "annual" ? "white" : "#FEF9EC",
                }}
              >
                BEST VALUE
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: selected === "annual" ? "#9A3412" : "#FDE68Acc" }}
              >
                Save 44%
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelected("monthly")}
          className="w-full rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98]"
          style={{
            background: selected === "monthly" ? "#FEF9EC" : "rgba(255,255,255,0.12)",
            border: selected === "monthly"
              ? "2px solid #FEF9EC"
              : "1.5px solid rgba(255,255,255,0.3)",
            color: selected === "monthly" ? "#C86B1A" : "#FEF9EC",
          }}
          data-testid="plan-monthly"
        >
          <p className="font-semibold text-base">Monthly</p>
          <p
            className="text-sm mt-0.5"
            style={{ color: selected === "monthly" ? "#9A3412" : "#FDE68Acc" }}
          >
            $2.99 / month
          </p>
        </button>
      </div>

      <button
        onClick={handleSubscribe}
        className="w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          color: "#1c1917",
        }}
        data-testid="subscribe-btn"
      >
        Subscribe Now
      </button>

      <p className="text-center text-xs mt-4" style={{ color: "#FEF3E2", opacity: 0.6 }}>
        Full access · Cancel anytime · No ads
      </p>

      <button
        onClick={handleRestore}
        className="w-full text-center text-xs mt-3 py-2 transition-opacity active:opacity-50"
        style={{ color: "#FEF3E2", opacity: 0.7 }}
        data-testid="restore-purchase-btn"
      >
        Already subscribed? Restore purchase
      </button>
    </div>
  );
}

export default function Paywall() {
  const savedEmail = getUserEmail();
  const [step, setStep] = useState<"email" | "subscribe">(
    savedEmail ? "subscribe" : "email"
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 overflow-y-auto"
      style={{ background: "linear-gradient(160deg, #C86B1A 0%, #E07B2A 50%, #D97706 100%)" }}
      data-testid="paywall-screen"
    >
      <div className="w-full max-w-sm py-10">
        {step === "email" ? (
          <EmailStep onContinue={() => setStep("subscribe")} />
        ) : (
          <SubscriptionStep />
        )}
      </div>
    </div>
  );
}
