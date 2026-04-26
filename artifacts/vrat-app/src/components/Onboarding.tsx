import { useState, type CSSProperties } from "react";
import {
  ONBOARDING_KEY,
  TRADITION_KEY,
  OBSERVED_KEY,
  CITY_KEY,
  LOCATION_KEY,
  REGION_KEY,
  LOCATION_OPTIONS,
  REGION_OPTIONS,
  type Tradition,
  type UserLocation,
  type UserRegion,
} from "@/hooks/useUserPrefs";

const DISCLAIMER_KEY = "vrat_disclaimer_accepted";

interface Props {
  onComplete: () => void;
}

// ─── Vrat catalogue for Screen 3 ────────────────────────────────────────────
const VRAT_OPTIONS: { id: string; label: string; subtitle: string; tradition: "Hindu" | "Jain" | "Sikh" }[] = [
  { id: "ekadashi",                   label: "Ekadashi",                       subtitle: "24 days a year",                      tradition: "Hindu" },
  { id: "purnima",                    label: "Purnima",                        subtitle: "Full moon · 12 days a year",          tradition: "Hindu" },
  { id: "pradosh",                    label: "Pradosh / Pradosham",            subtitle: "For Lord Shiva · 24 days a year",     tradition: "Hindu" },
  { id: "amavasya",                   label: "Amavasya",                       subtitle: "New moon · 12 days a year",           tradition: "Hindu" },
  { id: "sankashti",                  label: "Sankashti Chaturthi",            subtitle: "For Lord Ganesha · 12 days a year",   tradition: "Hindu" },
  { id: "maha-shivratri",             label: "Maha Shivratri",                 subtitle: "The great night of Shiva",            tradition: "Hindu" },
  { id: "navratri",                   label: "Navratri",                       subtitle: "Nine nights of Durga · twice a year", tradition: "Hindu" },
  { id: "janmashtami",                label: "Janmashtami",                    subtitle: "Birth of Lord Krishna",               tradition: "Hindu" },
  { id: "ram-navami",                 label: "Ram Navami",                     subtitle: "Birth of Lord Ram",                   tradition: "Hindu" },
  { id: "hanuman-jayanti",            label: "Hanuman Jayanti",                subtitle: "Hanuman ji",                          tradition: "Hindu" },
  { id: "ganesh-chaturthi",           label: "Ganesh Chaturthi",               subtitle: "Birth of Lord Ganesha",               tradition: "Hindu" },
  { id: "diwali",                     label: "Diwali / Lakshmi Puja",          subtitle: "Festival of lights",                  tradition: "Hindu" },
  { id: "karva-chauth",               label: "Karva Chauth",                   subtitle: "For a husband's long life",           tradition: "Hindu" },
  { id: "hartalika-teej",             label: "Hartalika Teej",                 subtitle: "For Lord Shiva and Parvati",          tradition: "Hindu" },
  { id: "hariyali-teej",              label: "Hariyali Teej",                  subtitle: "Monsoon celebration of Parvati",      tradition: "Hindu" },
  { id: "vat-savitri",                label: "Vat Savitri",                    subtitle: "For a husband's longevity",           tradition: "Hindu" },
  { id: "ahoi-ashtami",               label: "Ahoi Ashtami",                   subtitle: "For children's wellbeing",            tradition: "Hindu" },
  { id: "chhath-puja",                label: "Chhath Puja",                    subtitle: "For the Sun God · 36-hour strict fast", tradition: "Hindu" },
  { id: "akshaya-tritiya",            label: "Akshaya Tritiya",                subtitle: "The auspicious third",                tradition: "Hindu" },
  { id: "mahavir-jayanti",            label: "Mahavir Jayanti",                subtitle: "Birth of Lord Mahavira",              tradition: "Jain" },
  { id: "paryushana",                 label: "Paryushana",                     subtitle: "Eight days of reflection and fasting", tradition: "Jain" },
  { id: "samvatsari",                 label: "Samvatsari Pratikraman",         subtitle: "Annual day of forgiveness",           tradition: "Jain" },
  { id: "navpad-oli",                 label: "Navpad Oli",                     subtitle: "Nine days of austerity · twice a year", tradition: "Jain" },
  { id: "das-lakshana",               label: "Das Lakshana Parva",             subtitle: "Ten days of dharma",                  tradition: "Jain" },
  { id: "mahavira-nirvana",           label: "Mahavira Nirvana",               subtitle: "Jain Diwali · day of liberation",     tradition: "Jain" },
  { id: "guru-gobind-singh-gurpurab",   label: "Guru Gobind Singh Ji Gurpurab",      subtitle: "Poh 7 (Jan 6) · 10th Guru's Gurpurab",            tradition: "Sikh" },
  { id: "maghi",                        label: "Maghi",                              subtitle: "Magh 1 (Jan 14) · Battle of Muktsar",              tradition: "Sikh" },
  { id: "guru-har-rai-jayanti",         label: "Guru Har Rai Ji Jayanti",            subtitle: "Magh 18 (Jan 31) · 7th Guru's Gurpurab",           tradition: "Sikh" },
  { id: "guru-ravidas-jayanti",         label: "Guru Ravidas Ji Jayanti",            subtitle: "Phagan 1 (Feb 12) · Poet-saint's Jayanti",         tradition: "Sikh" },
  { id: "hola-mohalla",                 label: "Hola Mohalla",                       subtitle: "Phagan 19 (Mar 4) · Khalsa martial arts festival",  tradition: "Sikh" },
  { id: "baisakhi-sikh",                label: "Baisakhi (Vaisakhi)",                subtitle: "Vaisakh 1 (Apr 14) · Khalsa Sajna Divas",          tradition: "Sikh" },
  { id: "guru-arjan-dev-shaheedi",      label: "Guru Arjan Dev Ji Shaheedi Divas",   subtitle: "Harh 2 (Jun 16) · 5th Guru's Martyrdom Day",       tradition: "Sikh" },
  { id: "guru-hargobind-jayanti",       label: "Guru Hargobind Ji Gurpurab",         subtitle: "Harh 5 (Jun 19) · 6th Guru's Gurpurab",            tradition: "Sikh" },
  { id: "guru-har-krishan-jayanti",     label: "Guru Har Krishan Ji Gurpurab",       subtitle: "Sawan 8 (Jul 23) · 8th Guru's Gurpurab",           tradition: "Sikh" },
  { id: "sangrand",                     label: "Sangrand",                           subtitle: "1st of each Nanakshahi month · 12 per year",       tradition: "Sikh" },
  { id: "guru-ram-das-jayanti",         label: "Guru Ram Das Ji Gurpurab",           subtitle: "Assu 24 (Oct 9) · 4th Guru's Gurpurab",            tradition: "Sikh" },
  { id: "guru-granth-sahib-gurgaddi",  label: "Guru Granth Sahib Ji Gurgaddi Divas",subtitle: "Katik 5 (Oct 20) · Eternal Guru enthroned",        tradition: "Sikh" },
  { id: "bandi-chhor-divas",           label: "Bandi Chhor Divas",                  subtitle: "Katik 5 (Oct 20) · Day of Liberation",             tradition: "Sikh" },
  { id: "guru-nanak-gurpurab",         label: "Guru Nanak Dev Ji Gurpurab",          subtitle: "Katik 21 (Nov 5) · Founder of Sikhism",            tradition: "Sikh" },
  { id: "guru-tegh-bahadur-shaheedi", label: "Guru Tegh Bahadur Ji Shaheedi Divas", subtitle: "Maghar 10 (Nov 24) · 9th Guru's Martyrdom Day",    tradition: "Sikh" },
];

const HINDU_DEFAULTS = ["ekadashi", "purnima", "pradosh"];
const JAIN_DEFAULTS  = ["paryushana", "navpad-oli", "samvatsari"];
const SIKH_DEFAULTS  = ["guru-nanak-gurpurab", "baisakhi-sikh", "sangrand"];
const BOTH_DEFAULTS  = ["ekadashi", "purnima", "pradosh", "paryushana", "navpad-oli"];

function defaultsForTradition(t: Tradition): string[] {
  if (t === "Hindu") return HINDU_DEFAULTS;
  if (t === "Jain")  return JAIN_DEFAULTS;
  if (t === "Sikh")  return SIKH_DEFAULTS;
  return BOTH_DEFAULTS;
}

// ─── SVG Symbols ─────────────────────────────────────────────────────────────
function OmSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="currentColor" aria-hidden="true">
      <text x="50%" y="75%" textAnchor="middle" fontSize="52" fontFamily="serif">ॐ</text>
    </svg>
  );
}

function JainHandSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} fill="currentColor" aria-hidden="true">
      <path d="M30 78 C18 78 10 68 10 54 L10 26 C10 21.5 13.5 18 18 18 C20.5 18 22.5 19.2 24 21 L24 16 C24 11.5 27.5 8 32 8 C36.5 8 40 11.5 40 16 L40 18.5 C41.5 17 43.5 16 46 16 C50.5 16 54 19.5 54 24 L54 28 C55.5 26.5 57.5 25.5 60 25.5 C64.5 25.5 68 29 68 33.5 L68 54 C68 68 58 78 46 78 Z" transform="scale(0.7) translate(4, 2)" />
      <circle cx="30" cy="48" r="9" fill="white" />
      <path d="M25 48 L35 48 M30 43 L30 53" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function KhandaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 120" className={className} style={style} fill="currentColor" aria-hidden="true">
      {/* Left kirpan — arched curved sword */}
      <path d="M18 8 C8 35 10 68 30 88" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="8" r="4.5" />
      {/* Right kirpan — mirror */}
      <path d="M82 8 C92 35 90 68 70 88" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="82" cy="8" r="4.5" />
      {/* Chakkar (ring) */}
      <circle cx="50" cy="80" r="22" fill="none" stroke="currentColor" strokeWidth="7" />
      {/* Central blade — double-edged pointed top */}
      <path d="M50 6 L44 46 L50 54 L56 46 Z" />
      {/* Crossguard */}
      <rect x="30" y="42" width="40" height="7" rx="3.5" />
      {/* Handle grip (passes through chakkar) */}
      <rect x="47" y="54" width="6" height="18" rx="2" />
      {/* Pommel */}
      <ellipse cx="50" cy="74" rx="6" ry="4" />
    </svg>
  );
}

function BothSymbol({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <OmSvg className="w-7 h-7 text-amber-700" />
      <JainHandSvg className="w-5 h-7 text-green-700" />
    </div>
  );
}

// ─── Diya illustration for final screen ───────────────────────────────────────
function DiyaSvg() {
  return (
    <svg viewBox="0 0 140 160" className="w-36 h-44 mx-auto" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F97316" />
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="85" rx="55" ry="55" fill="url(#glow)" />
      <path d="M70 28 C60 42 57 60 66 70 C68 73 70 74 70 74 C70 74 72 73 74 70 C83 60 80 42 70 28 Z" fill="url(#flameGrad)" />
      <path d="M70 42 C65 52 64 63 68 70 C69 72 70 73 70 73 C70 73 71 72 72 70 C76 63 75 52 70 42 Z" fill="#FFFDE7" opacity="0.85" />
      <path d="M70 74 C74 80 80 86 86 90" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 102 Q36 128 70 130 Q104 128 108 102 Q104 94 70 91 Q36 94 32 102 Z" fill="#C2410C" />
      <path d="M97 94 Q108 88 116 90 Q118 98 107 102 Q102 98 97 94 Z" fill="#9A3412" />
      <ellipse cx="70" cy="102" rx="22" ry="6" fill="#92400E" opacity="0.5" />
      <ellipse cx="62" cy="99" rx="7" ry="2.5" fill="#FCD34D" opacity="0.3" transform="rotate(-10 62 99)" />
      <circle cx="50" cy="115" r="2.5" fill="#FCD34D" opacity="0.6" />
      <circle cx="70" cy="122" r="2.5" fill="#FCD34D" opacity="0.6" />
      <circle cx="90" cy="115" r="2.5" fill="#FCD34D" opacity="0.6" />
    </svg>
  );
}

// ─── Step indicator dots ──────────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 justify-center mt-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            backgroundColor: i === current ? "#E07B2A" : "#E07B2A40",
          }}
        />
      ))}
    </div>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors"
      style={{ backgroundColor: on ? "#E07B2A" : "#D1D5DB" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ─── Vrat row (used in Screen 3) ─────────────────────────────────────────────
function VratRow({
  opt,
  on,
  onToggle,
}: {
  opt: { id: string; label: string; subtitle: string };
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-foreground">{opt.label}</p>
        <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

// ─── Main Onboarding component ────────────────────────────────────────────────
export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [tradition, setTradition] = useState<Tradition>("Hindu");
  const [observed, setObserved] = useState<string[]>(HINDU_DEFAULTS);
  const [location, setLocation] = useState<UserLocation>("india");
  const [region, setRegion] = useState<UserRegion>("all");
  const [city, setCity] = useState("");

  const TOTAL_STEPS = 7;

  function chooseTradition(t: Tradition) {
    setTradition(t);
    setObserved(defaultsForTradition(t));
  }

  function toggleVrat(id: string) {
    setObserved((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function finish() {
    localStorage.setItem(TRADITION_KEY, tradition);
    localStorage.setItem(OBSERVED_KEY, JSON.stringify(observed));
    localStorage.setItem(CITY_KEY, city.trim());
    localStorage.setItem(LOCATION_KEY, location);
    localStorage.setItem(REGION_KEY, region);
    localStorage.setItem(ONBOARDING_KEY, "1");
    localStorage.setItem(DISCLAIMER_KEY, "1");
    onComplete();
  }

  const visibleVrats =
    tradition === "Hindu" ? VRAT_OPTIONS.filter((v) => v.tradition === "Hindu") :
    tradition === "Jain"  ? VRAT_OPTIONS.filter((v) => v.tradition === "Jain") :
    tradition === "Sikh"  ? VRAT_OPTIONS.filter((v) => v.tradition === "Sikh") :
    VRAT_OPTIONS.filter((v) => v.tradition === "Hindu" || v.tradition === "Jain");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ width: `${TOTAL_STEPS * 100}%`, transform: `translateX(-${(step * 100) / TOTAL_STEPS}%)` }}
      >
        {/* ── Screen 1: Welcome ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col items-center justify-between px-6 pb-12 safe-top"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #C86B1A 0%, #E07B2A 50%, #D97706 100%)" }}
        >
          <div />
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-6">
              <OmSvg className="w-12 h-12 text-amber-200 opacity-90" />
              <JainHandSvg className="w-8 h-11 text-amber-100 opacity-80" />
              <KhandaSvg className="w-12 h-12" style={{ color: "#003DA5" }} />
            </div>
            <h1 className="font-serif text-6xl font-bold mb-4 tracking-tight" style={{ color: "#FEF9EC" }}>
              VRAT
            </h1>
            <p className="text-3xl font-serif font-semibold mb-3" style={{ color: "#FDE68A" }}>
              Your fast. Your way.
            </p>
            <p className="text-base leading-relaxed opacity-85" style={{ color: "#FEF3E2" }}>
              A sacred companion for Hindu, Jain, and Sikh families
            </p>
          </div>
          <div className="w-full max-w-xs">
            <StepDots total={TOTAL_STEPS} current={0} />
            <button
              onClick={() => setStep(1)}
              className="mt-5 w-full py-4 rounded-2xl font-semibold text-base tracking-wide transition-opacity active:opacity-80"
              style={{ background: "rgba(255,255,255,0.2)", color: "#FEF9EC", border: "1.5px solid rgba(255,255,255,0.4)" }}
            >
              Begin my journey
            </button>
          </div>
        </div>

        {/* ── Screen 2: Tradition ──────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 1 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Which tradition do you follow?</h2>
            <p className="text-sm text-muted-foreground mb-8">
              We'll personalise your calendar and vrat guidance accordingly.
            </p>

            <div className="space-y-3">
              {(
                [
                  {
                    value: "Hindu" as Tradition,
                    label: "Hindu",
                    subtitle: "Ekadashi, Navratri, Karva Chauth and more",
                    icon: <OmSvg className="w-12 h-12 text-amber-600" />,
                    accent: "#E07B2A",
                  },
                  {
                    value: "Jain" as Tradition,
                    label: "Jain",
                    subtitle: "Paryushana, Navpad Oli, Samvatsari and more",
                    icon: <JainHandSvg className="w-9 h-12 text-green-600" />,
                    accent: "#22C55E",
                  },
                  {
                    value: "Sikh" as Tradition,
                    label: "Sikh",
                    subtitle: "Gurpurabs, Baisakhi, Sangrand and more",
                    icon: <KhandaSvg className="w-12 h-12" style={{ color: "#003DA5" }} />,
                    accent: "#003DA5",
                  },
                  {
                    value: "Both" as Tradition,
                    label: "Both",
                    subtitle: "Hindu and Jain observances together",
                    icon: <BothSymbol className="w-14 h-10" />,
                    accent: "#D4A017",
                  },
                ] as const
              ).map((opt) => {
                const selected = tradition === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => chooseTradition(opt.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
                    style={{
                      border: `2px solid ${selected ? opt.accent : "#E5E7EB"}`,
                      background: selected ? `${opt.accent}12` : "white",
                    }}
                  >
                    <div className="w-14 flex items-center justify-center flex-shrink-0">
                      {opt.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-base text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.subtitle}</p>
                    </div>
                    {selected && (
                      <div
                        className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: opt.accent }}
                      >
                        <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <StepDots total={TOTAL_STEPS} current={1} />
            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Screen 3: Vrat toggles ───────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="px-6 pb-3 safe-top">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 2 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-1">Which vrats do you observe?</h2>
            <p className="text-sm text-muted-foreground">
              Toggle on the ones you keep. Your personal vrats will be starred in the calendar.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {tradition === "Both" ? (
              <>
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2 mt-2">Hindu</p>
                {VRAT_OPTIONS.filter((v) => v.tradition === "Hindu").map((opt) => (
                  <VratRow key={opt.id} opt={opt} on={observed.includes(opt.id)} onToggle={() => toggleVrat(opt.id)} />
                ))}
                <p className="text-xs font-semibold tracking-widest uppercase text-green-700 mb-2 mt-5">Jain</p>
                {VRAT_OPTIONS.filter((v) => v.tradition === "Jain").map((opt) => (
                  <VratRow key={opt.id} opt={opt} on={observed.includes(opt.id)} onToggle={() => toggleVrat(opt.id)} />
                ))}
              </>
            ) : (
              visibleVrats.map((opt) => (
                <VratRow key={opt.id} opt={opt} on={observed.includes(opt.id)} onToggle={() => toggleVrat(opt.id)} />
              ))
            )}
            <div className="h-4" />
          </div>

          <div className="px-6 pb-10">
            <StepDots total={TOTAL_STEPS} current={2} />
            <button
              onClick={() => setStep(3)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Screen 4: Location ───────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 3 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Where are you based?</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Panchang dates are rooted in IST. We'll show you a regional note so you can confirm with your local pandit.
            </p>

            <div className="space-y-3">
              {LOCATION_OPTIONS.map((opt) => {
                const selected = location === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setLocation(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
                    style={{
                      border: `2px solid ${selected ? "#E07B2A" : "#E5E7EB"}`,
                      background: selected ? "#E07B2A12" : "white",
                    }}
                    data-testid={`location-option-${opt.id}`}
                  >
                    <span className="text-3xl flex-shrink-0" aria-hidden="true">{opt.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.timezone}</p>
                    </div>
                    {selected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#E07B2A" }}
                      >
                        <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <StepDots total={TOTAL_STEPS} current={3} />
            <button
              onClick={() => setStep(4)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Screen 5: Region ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 4 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Which region do you follow?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We'll add regional vrats for your area alongside the pan-Indian calendar.
            </p>

            <div className="space-y-2">
              {REGION_OPTIONS.map((opt) => {
                const selected = region === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setRegion(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
                    style={{
                      border: `2px solid ${selected ? "#E07B2A" : "#E5E7EB"}`,
                      background: selected ? "#E07B2A12" : "white",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-foreground">{opt.label}</p>
                    </div>
                    {selected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#E07B2A" }}
                      >
                        <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <StepDots total={TOTAL_STEPS} current={4} />
            <button
              onClick={() => setStep(5)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Screen 6: City ───────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 5 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">What is your city?</h2>
            <p className="text-sm text-muted-foreground mb-8">
              We use this to calculate Brahma Muhurta and moonrise times accurately for your location.
            </p>

            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai, Delhi, New York..."
              className="w-full px-4 py-4 rounded-2xl text-base border-2 outline-none transition-all bg-white"
              style={{
                borderColor: city ? "#E07B2A" : "#E5E7EB",
                color: "#1C1917",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#E07B2A")}
              onBlur={(e) => (e.target.style.borderColor = city ? "#E07B2A" : "#E5E7EB")}
              autoComplete="off"
            />

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-amber-800 leading-relaxed">
                We use this only to calculate sunrise and moonrise times for you. We never store or share your location.
              </p>
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <StepDots total={TOTAL_STEPS} current={5} />
            <button
              onClick={() => setStep(6)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              {city.trim() ? "Next" : "Skip for now"}
            </button>
          </div>
        </div>

        {/* ── Screen 6: All set ────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col items-center justify-between px-6 pb-14 safe-top"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #C86B1A 0%, #E07B2A 50%, #D97706 100%)" }}
        >
          <div />
          <div className="text-center text-white w-full max-w-xs">
            <DiyaSvg />
            <h2 className="font-serif text-4xl font-bold mt-6 mb-2" style={{ color: "#FEF9EC" }}>
              You are all set.
            </h2>
            <p className="text-2xl font-serif font-semibold mb-4" style={{ color: "#FDE68A" }}>
              {tradition === "Sikh"
                ? "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh."
                : tradition === "Jain"
                ? "Jai Jinendra."
                : "Jai Mata Di."}
            </p>
            <p className="text-sm leading-relaxed opacity-80" style={{ color: "#FEF3E2" }}>
              Your personal vrat calendar is ready.{" "}
              {tradition !== "Both"
                ? `Showing ${tradition} vrats.`
                : "Showing Hindu and Jain vrats."}
            </p>
          </div>
          <div className="w-full max-w-xs">
            <button
              onClick={finish}
              className="w-full py-4 rounded-2xl font-semibold text-base tracking-wide transition-opacity active:opacity-80"
              style={{ background: "rgba(255,255,255,0.2)", color: "#FEF9EC", border: "1.5px solid rgba(255,255,255,0.4)" }}
            >
              Enter VRAT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
