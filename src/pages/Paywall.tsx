import { useState, useEffect } from "react";
import { getUserEmail, setUserEmail, setSubscribed } from "@/hooks/useUserPrefs";
import { detectCurrency, type Currency } from "@/utils/currencyDetect";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type Plan = "monthly" | "annual" | "lifetime";

const PRICES = {
  monthly:  { usd: "$2.99/month",  inr: "₹249/month"  },
  annual:   { usd: "$19.99/year",  inr: "₹1,699/year" },
  lifetime: { usd: "$49.99",       inr: "₹3,999"      },
};

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
        <p className="text-sm mt-3 leading-relaxed px-2" style={{ color: "#FEF3E2", opacity: 0.85 }}>
          We'll send your receipt and renewal reminders here.
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
        {error && <p className="text-xs px-1" style={{ color: "#FCA5A5" }}>{error}</p>}
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

type AppliedPromo = {
  code: string;
  currency: Currency;
  plan: Plan;
  originalAmount: number;
  discountedAmount: number;
  discountLabel: string;
};

function formatAmount(amount: number, currency: Currency): string {
  // Stripe amounts are in the smallest currency unit (cents/paise).
  const major = amount / 100;
  if (currency === "inr") {
    return `₹${major.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }
  return `$${major.toFixed(2)}`;
}

function SubscriptionStep({ showCancelled }: { showCancelled?: boolean }) {
  const [selected, setSelected] = useState<Plan>("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [currency, setCurrency] = useState<Currency | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const email = getUserEmail();

  useEffect(() => {
    detectCurrency().then(setCurrency);
  }, []);

  // The discount is computed against a specific plan + currency, so any
  // change to either invalidates the applied promo and forces a re-apply.
  useEffect(() => {
    if (appliedPromo && (appliedPromo.plan !== selected || appliedPromo.currency !== currency)) {
      setAppliedPromo(null);
      setPromoError("");
    }
  }, [selected, currency, appliedPromo]);

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code || !currency) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch(`${API_BASE}/api/stripe/validate-promo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, plan: selected, currency }),
      });
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        setPromoError("Could not check this code right now. Please try again.");
        return;
      }
      const data = await res.json();
      if (!data.valid) {
        setPromoError(data.error || "This code is not valid.");
        setAppliedPromo(null);
        return;
      }
      setAppliedPromo({
        code: data.code,
        currency,
        plan: selected,
        originalAmount: data.originalAmount,
        discountedAmount: data.discountedAmount,
        discountLabel: data.discountLabel,
      });
    } catch {
      setPromoError("Could not check this code. Please check your connection.");
    } finally {
      setPromoLoading(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  }

  async function handleSubscribe() {
    if (!email || !currency) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          plan: selected,
          currency,
          ...(appliedPromo ? { promoCode: appliedPromo.code } : {}),
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        setError("Payment system temporarily unavailable. Please try again in a moment.");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Could not connect. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    if (!email) return;
    setRestoring(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/stripe/verify?email=${encodeURIComponent(email)}`);

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        setError("Could not reach the server. Please try again in a moment.");
        return;
      }

      const data = await res.json();

      if (data.subscribed) {
        setSubscribed();
        window.location.reload();
      } else {
        setError("No active subscription found for this email. Please subscribe to continue.");
      }
    } catch {
      setError("Could not verify. Please check your internet connection.");
    } finally {
      setRestoring(false);
    }
  }

  const c = currency ?? "usd";
  const monthlyPrice  = PRICES.monthly[c];
  const annualPrice   = PRICES.annual[c];
  const lifetimePrice = PRICES.lifetime[c];

  const plans: { id: Plan; label: string; price: string; badge?: string; sub?: string }[] = [
    {
      id: "annual",
      label: "Yearly",
      price: annualPrice,
      badge: "BEST VALUE",
      sub: "Save 44%",
    },
    {
      id: "monthly",
      label: "Monthly",
      price: monthlyPrice,
    },
    {
      id: "lifetime",
      label: "Lifetime",
      price: lifetimePrice,
      sub: "Pay once, yours forever",
    },
  ];

  return (
    <div className="w-full max-w-sm">
      <DiyaFlame />

      <div className="text-center mt-5 mb-6">
        <h1
          className="font-serif text-2xl font-bold leading-snug mb-2"
          style={{ color: "#FEF9EC" }}
          data-testid="paywall-heading"
        >
          Your free trial has ended 🙏
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "#FDE68A" }}>
          Continue your vrat journey with{" "}
          <span className="font-semibold">V<span style={{ color: "#FF9933" }}>RA</span>T Premium</span>
        </p>
        {showCancelled && (
          <p className="text-xs mt-2 px-2" style={{ color: "#FCA5A5" }}>
            Payment was not completed. You can try again below.
          </p>
        )}
      </div>

      {currency === null ? (
        <div className="space-y-3 mb-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-full rounded-2xl px-5 py-4 animate-pulse"
              style={{ background: "rgba(255,255,255,0.12)", height: 68 }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {plans.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className="w-full rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98]"
                style={{
                  background: active ? "#FEF9EC" : "rgba(255,255,255,0.12)",
                  border: active ? "2px solid #FEF9EC" : "1.5px solid rgba(255,255,255,0.3)",
                  color: active ? "#C86B1A" : "#FEF9EC",
                }}
                data-testid={`plan-${plan.id}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-base">{plan.label}</p>
                    <p className="text-sm mt-0.5" style={{ color: active ? "#9A3412" : "#FDE68Acc" }}>
                      {plan.price}
                    </p>
                  </div>
                  {(plan.badge || plan.sub) && (
                    <div className="flex flex-col items-end gap-1">
                      {plan.badge && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: active ? "#E07B2A" : "rgba(255,255,255,0.2)",
                            color: active ? "white" : "#FEF9EC",
                          }}
                        >
                          {plan.badge}
                        </span>
                      )}
                      {plan.sub && (
                        <span className="text-xs font-medium" style={{ color: active ? "#9A3412" : "#FDE68Acc" }}>
                          {plan.sub}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {currency !== null && (
        <div className="mb-5">
          {!appliedPromo ? (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                  placeholder="Promo / coupon code"
                  className="flex-1 min-w-0 px-4 py-3 rounded-2xl text-sm outline-none transition-all uppercase tracking-wider"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: promoError ? "1.5px solid #FCA5A5" : "1.5px solid rgba(255,255,255,0.35)",
                    color: "#FEF9EC",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && promoInput.trim() && !promoLoading && handleApplyPromo()}
                  data-testid="promo-input"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={!promoInput.trim() || promoLoading}
                  className="px-5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.22)", color: "#FEF9EC", border: "1.5px solid rgba(255,255,255,0.35)" }}
                  data-testid="promo-apply-btn"
                >
                  {promoLoading ? "…" : "Apply"}
                </button>
              </div>
              {promoError && (
                <p className="text-xs px-1 mt-2" style={{ color: "#FCA5A5" }} data-testid="promo-error">
                  {promoError}
                </p>
              )}
            </>
          ) : (
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: "rgba(34,197,94,0.18)", border: "1.5px solid rgba(134,239,172,0.5)" }}
              data-testid="promo-applied"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#FEF9EC" }}>
                    ✓ {appliedPromo.code} — {appliedPromo.discountLabel}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#FEF3E2", opacity: 0.85 }}>
                    <span style={{ textDecoration: "line-through", opacity: 0.7 }}>
                      {formatAmount(appliedPromo.originalAmount, appliedPromo.currency)}
                    </span>
                    {" → "}
                    <span className="font-bold">
                      {formatAmount(appliedPromo.discountedAmount, appliedPromo.currency)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleRemovePromo}
                  className="text-xs underline transition-opacity active:opacity-50 flex-shrink-0"
                  style={{ color: "#FEF3E2", opacity: 0.8 }}
                  data-testid="promo-remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-center mb-3 px-2" style={{ color: "#FCA5A5" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading || currency === null}
        className="w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all active:scale-[0.98] disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          color: "#1c1917",
        }}
        data-testid="subscribe-btn"
      >
        {loading
          ? "Redirecting to payment…"
          : appliedPromo
          ? `Pay ${formatAmount(appliedPromo.discountedAmount, appliedPromo.currency)}${selected === "lifetime" ? "" : selected === "annual" ? " / year" : " / month"}`
          : selected === "lifetime"
          ? "Get Lifetime Access"
          : "Subscribe Now"}
      </button>

      <p className="text-center text-xs mt-4" style={{ color: "#FEF3E2", opacity: 0.6 }}>
        {selected === "lifetime"
          ? "Pay once · Full access forever · No renewal"
          : "Full access · Cancel anytime · No ads"}
      </p>
      <p className="text-center text-xs mt-1" style={{ color: "#FEF3E2", opacity: 0.45 }}>
        Your first 30 days were free — no card was required.
      </p>

      <button
        onClick={handleRestore}
        disabled={restoring}
        className="w-full text-center text-xs mt-4 py-2 transition-opacity active:opacity-50 disabled:opacity-40"
        style={{ color: "#FEF3E2", opacity: 0.7 }}
        data-testid="restore-purchase-btn"
      >
        {restoring ? "Checking…" : "Already subscribed? Restore access"}
      </button>
    </div>
  );
}

export default function Paywall({ showCancelled }: { showCancelled?: boolean }) {
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
          <SubscriptionStep showCancelled={showCancelled} />
        )}
      </div>
    </div>
  );
}
