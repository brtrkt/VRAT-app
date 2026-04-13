import { useLocation } from "wouter";

const ACCENT = "#FF6F00";
const DARK   = "#78350F";

interface StepProps {
  number: number;
  text: string;
}

function Step({ number, text }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold mt-0.5"
        style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #E65100 100%)` }}
      >
        {number}
      </div>
      <p className="text-sm leading-relaxed pt-0.5" style={{ color: DARK }}>
        {text}
      </p>
    </div>
  );
}

interface PlatformCardProps {
  icon: string;
  title: string;
  subtitle: string;
  steps: string[];
}

function PlatformCard({ icon, title, subtitle, steps }: PlatformCardProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1.5px solid rgba(255,111,0,0.25)" }}
    >
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #FFF3E0 0%, #FFF8E1 100%)" }}
      >
        <span className="text-3xl" aria-hidden="true">{icon}</span>
        <div>
          <p className="font-semibold text-base" style={{ color: DARK }}>{title}</p>
          <p className="text-xs" style={{ color: "#A16207" }}>{subtitle}</p>
        </div>
      </div>
      <div className="bg-white px-5 py-5 space-y-4">
        {steps.map((step, i) => (
          <Step key={i} number={i + 1} text={step} />
        ))}
      </div>
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: "#FFF8E1", borderTop: "1px solid rgba(255,111,0,0.15)" }}
      >
        <span className="text-base" aria-hidden="true">✅</span>
        <p className="text-xs font-semibold" style={{ color: "#16A34A" }}>
          VRAT now appears on your home screen like a real app
        </p>
      </div>
    </div>
  );
}

export default function HowToInstall() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: "linear-gradient(160deg, #FFF3E0 0%, #FFFDE7 100%)" }}
    >
      <div className="max-w-md mx-auto px-5 pt-6 pb-8">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 text-sm mb-6 -ml-1 active:opacity-70"
          style={{ color: "#A16207" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Settings
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🪔</span>
          <h1 className="font-serif text-2xl font-bold" style={{ color: DARK }}>
            Add VRAT to your home screen
          </h1>
        </div>
        <p className="text-sm mb-7 leading-relaxed" style={{ color: "#A16207" }}>
          Install VRAT like a real app — no App Store needed. It opens full screen, works offline, and keeps all your data.
        </p>

        <div className="space-y-5">
          <PlatformCard
            icon="🍎"
            title="iPhone / iPad"
            subtitle="Use Safari browser"
            steps={[
              "Open this link in Safari (not Chrome or Firefox)",
              "Tap the Share button at the bottom of your screen — it looks like a box with an arrow pointing up",
              "Scroll down in the share sheet and tap \"Add to Home Screen\"",
              "Give it a name (or keep \"VRAT\") and tap \"Add\" in the top right corner",
              "VRAT now appears on your home screen like a real app",
            ]}
          />

          <PlatformCard
            icon="🤖"
            title="Android"
            subtitle="Use Chrome browser"
            steps={[
              "Open this link in Chrome",
              "Tap the three-dot menu (⋮) in the top right corner of Chrome",
              "Tap \"Add to Home Screen\" or \"Install App\"",
              "Tap \"Add\" to confirm",
              "VRAT now appears on your home screen like a real app",
            ]}
          />
        </div>

        <div
          className="mt-6 rounded-2xl px-5 py-4"
          style={{ background: "#FFF8E1", border: "1px solid rgba(255,111,0,0.2)" }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: DARK }}>
            ✨ Why install?
          </p>
          <ul className="text-xs space-y-1.5 leading-relaxed" style={{ color: "#92400E" }}>
            <li>• Opens instantly without any browser bar or address bar</li>
            <li>• Works fully offline — no internet needed on fasting days</li>
            <li>• All your vrat streaks, history and settings are saved</li>
            <li>• Custom splash screen in saffron and gold</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
