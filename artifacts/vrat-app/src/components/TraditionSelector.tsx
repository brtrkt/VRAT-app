import { useState, type CSSProperties, type ReactNode } from "react";
import type { Tradition } from "@/hooks/useUserPrefs";

// ─── Icon primitives ─────────────────────────────────────────────────────────
// All tradition icons live here as the single source of truth so Home,
// Onboarding, Settings, and any future surface render the same artwork.

export function KhandaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 838" className={className} style={style} aria-hidden="true">
      <path d="M 382.877 20.123 C 369.559 30.822, 345.376 45.962, 330.750 52.758 L 324 55.895 324 60.716 C 324 63.367, 325.121 70.478, 326.491 76.518 C 330.918 96.036, 331.246 95.385, 314.461 100.337 C 256.870 117.327, 191.500 172.746, 164.465 227.500 C 128.787 299.759, 133.953 392.025, 177.399 458.500 C 205.721 501.836, 258.627 543.384, 305.275 558.925 C 319.415 563.636, 319.789 564.487, 315.501 582.186 C 311.341 599.359, 309.421 597.713, 335.145 599.034 C 362.888 600.459, 359.904 596.918, 363.140 632.263 C 364.614 648.366, 366.925 648.221, 339.819 633.723 C 252.035 586.770, 204.974 549.771, 163.695 495.259 C 67.338 368.009, 85.097 234.198, 213 123.764 C 234.742 104.992, 234.667 103.873, 212.041 109.559 C 110.139 135.170, 38.463 217.919, 19.001 332.424 C -3.183 462.948, 77.786 612.592, 213.874 692.578 C 223.306 698.122, 229.221 704.156, 231.270 710.324 C 233.906 718.262, 236.150 716.989, 261 693.454 C 278.715 676.677, 287.385 669.523, 297.935 662.980 L 306.023 657.964 315.262 664.154 C 330.925 674.649, 347.391 686.178, 349.711 688.277 C 352.765 691.038, 351.984 692.143, 339.263 703.039 C 313.054 725.490, 308.858 729.378, 303.067 736.577 C 282.832 761.731, 290.623 784.971, 319.300 784.994 C 330.385 785.004, 333.416 782.872, 342.754 768.500 C 346.597 762.584, 352.819 754.927, 357.990 749.750 C 373.817 733.904, 377.458 740.437, 362.850 758.470 C 333.229 795.033, 383.820 841.515, 416.786 808.026 C 431.330 793.250, 431.601 775.970, 417.578 757.500 C 411.168 749.057, 410 746.910, 410 743.566 C 410 734.605, 425.868 749.290, 441.223 772.463 C 451.449 787.894, 469.510 790.098, 482.357 777.483 C 498.744 761.393, 491.697 745.849, 452.882 712.466 C 432.026 694.528, 428.655 691.121, 430.072 689.413 C 430.659 688.706, 441.041 681.316, 453.142 672.992 L 475.144 657.858 482.035 661.952 C 491.830 667.771, 501.058 675.358, 520.523 693.600 C 544.940 716.481, 546.929 717.777, 549.146 712.250 C 553.075 702.455, 555.873 699.765, 573.512 688.823 C 660.606 634.799, 723.719 555.962, 752.815 464.849 C 802.830 308.231, 705.681 131.137, 556.250 106.524 C 547.729 105.121, 550.304 108.484, 571.500 126.448 C 654.376 196.686, 688.599 278.271, 674.504 372 C 661.836 456.236, 588.780 548.821, 488.500 607.724 C 467.194 620.239, 420.825 645, 418.695 645 C 417.216 645, 419.673 608.756, 421.553 602.832 C 422.335 600.370, 423.498 600.193, 446.302 599.048 C 471.150 597.801, 470.002 598.724, 466.055 583.167 C 461.173 563.920, 460.979 564.315, 478.486 557.960 C 610.741 509.951, 674.863 366.463, 621.629 237.646 C 598.393 181.420, 529.902 119.704, 470.500 101.468 C 453.923 96.379, 453.151 96.050, 452.427 93.771 C 452.076 92.664, 453.259 84.451, 455.056 75.521 C 458.967 56.086, 459.278 57.164, 448.152 51.576 C 432.526 43.728, 411.049 30.140, 398.803 20.352 C 390.615 13.808, 390.737 13.809, 382.877 20.123 M 329.723 164.487 C 173.505 220.082, 164.045 413.813, 313.840 489.732 C 335.376 500.647, 334.660 501.050, 339.953 475 C 353.029 410.637, 357.976 316.778, 352.180 243 C 345.822 162.064, 344.963 159.063, 329.723 164.487 M 438.720 164.138 C 433.355 172.743, 426.995 257.397, 427.010 320 C 427.027 389.999, 430.285 424.681, 441.616 475.500 C 447.333 501.142, 445.886 499.900, 461.500 492.567 C 615.210 420.383, 612.274 229.328, 456.490 166.524 C 444.255 161.592, 440.613 161.102, 438.720 164.138" fill="currentColor" fillRule="evenodd" stroke="none" />
    </svg>
  );
}

export function OmSymbol({ className = "" }: { className?: string }) {
  return <span className={`font-serif ${className}`} aria-hidden="true">ॐ</span>;
}

export function JainSymbol({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" fill="currentColor" aria-hidden="true" className={className} style={style}>
      {/* Palm + wrist */}
      <path d="M14 78 L14 44 Q14 36 22 35 L40 35 Q48 36 50 44 L50 60 Q50 78 38 78 Z" />
      {/* Four fingers */}
      <rect x="18" y="10" width="6" height="30" rx="3" />
      <rect x="26" y="6"  width="6" height="34" rx="3" />
      <rect x="34" y="8"  width="6" height="32" rx="3" />
      <rect x="42" y="14" width="6" height="26" rx="3" />
      {/* Thumb — angled out from the side of the palm */}
      <path d="M14 46 Q6 38 3 30 Q1 24 5 22 Q9 20 12 26 Q15 32 18 40 Z" />
      {/* Wheel of Ahimsa on the palm */}
      <circle cx="32" cy="58" r="11" fill="white" />
      <circle cx="32" cy="58" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="58" r="2.2" />
      <path d="M32 49 L32 67 M23 58 L41 58 M25.5 51.5 L38.5 64.5 M38.5 51.5 L25.5 64.5"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function OmSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="currentColor" aria-hidden="true">
      <text x="50%" y="75%" textAnchor="middle" fontSize="52" fontFamily="serif">ॐ</text>
    </svg>
  );
}

export function JainHandSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} fill="currentColor" aria-hidden="true">
      <path d="M30 78 C18 78 10 68 10 54 L10 26 C10 21.5 13.5 18 18 18 C20.5 18 22.5 19.2 24 21 L24 16 C24 11.5 27.5 8 32 8 C36.5 8 40 11.5 40 16 L40 18.5 C41.5 17 43.5 16 46 16 C50.5 16 54 19.5 54 24 L54 28 C55.5 26.5 57.5 25.5 60 25.5 C64.5 25.5 68 29 68 33.5 L68 54 C68 68 58 78 46 78 Z" transform="scale(0.7) translate(4, 2)" />
      <circle cx="30" cy="48" r="9" fill="white" />
      <path d="M25 48 L35 48 M30 43 L30 53" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LotusSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <ellipse cx="30" cy="24" rx="5" ry="14" opacity="0.9" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-28 30 42)" opacity="0.85" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(28 30 42)" opacity="0.85" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-58 30 42)" opacity="0.75" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(58 30 42)" opacity="0.75" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-85 30 42)" opacity="0.6" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(85 30 42)" opacity="0.6" />
      <circle cx="30" cy="42" r="7" />
    </svg>
  );
}

export function IskconLogoSvg({ className = "" }: { className?: string; style?: CSSProperties }) {
  return <img src="/iskcon_logo.svg" className={className} alt="ISKCON" style={{ objectFit: "contain" }} />;
}

export function VitthalSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M22 4 L26 1 L30 4 L34 1 L38 4 L37 10 L23 10 Z"/>
      <circle cx="30" cy="15" r="5"/>
      <path d="M27 19 L33 19 L37 22 L44 26 L44 30 L40 31 L36 28 L36 40 L24 40 L24 28 L20 31 L16 30 L16 26 L23 22 Z"/>
      <path d="M24 40 L36 40 L38 58 L22 58 Z"/>
      <rect x="25" y="58" width="4" height="14"/>
      <rect x="31" y="58" width="4" height="14"/>
      <rect x="14" y="72" width="32" height="6" rx="1"/>
    </svg>
  );
}

export function UrdhvaPundraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 64" className={className} style={style} aria-hidden="true">
      <path d="M5 4 H17 V40 Q17 44 21 44 H27 Q31 44 31 40 V4 H43 V42 Q43 56 31 56 H17 Q5 56 5 42 Z" fill="white" />
      <path d="M24 3 Q19 18 21 32 Q22 40 24 46 Q26 40 27 32 Q29 18 24 3 Z" fill="#DC2626" />
      <circle cx="24" cy="60" r="3.4" fill="#DC2626" />
    </svg>
  );
}

export function NaamamSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="17" y1="6" x2="17" y2="55" stroke="currentColor" strokeWidth="6.5"/>
      <line x1="43" y1="6" x2="43" y2="55" stroke="currentColor" strokeWidth="6.5"/>
      <path d="M14 55 C14 74 46 74 46 55" stroke="currentColor" strokeWidth="6.5"/>
      <line x1="30" y1="10" x2="30" y2="62" stroke="#DC2626" strokeWidth="6.5"/>
    </svg>
  );
}

export function SriYantraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="30" cy="30" r="27" strokeWidth="1.5"/>
      <polygon points="30,8 8,46 52,46"/>
      <polygon points="30,52 8,14 52,14"/>
      <polygon points="30,15 14,40 46,40"/>
      <polygon points="30,45 14,20 46,20"/>
      <circle cx="30" cy="30" r="2.5" fill="currentColor"/>
    </svg>
  );
}

export function TripundraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <rect x="6" y="18" width="48" height="4" rx="2"/>
      <rect x="6" y="28" width="48" height="4" rx="2"/>
      <rect x="6" y="38" width="48" height="4" rx="2"/>
      <circle cx="30" cy="30" r="3"/>
    </svg>
  );
}

export function ShrinathjiSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M14 8 Q22 2 28 5 Q34 1 40 5 Q48 2 50 9 Q49 13 44 13 L18 13 Q12 13 14 8 Z"/>
      <rect x="22" y="12" width="4" height="22" rx="2"/>
      <path d="M28 26 L30 22 L32 25 L34 21 L36 25 L38 22 L40 26 Z"/>
      <ellipse cx="34" cy="32" rx="5" ry="6"/>
      <path d="M27 38 L41 38 L41 60 L27 60 Z"/>
      <rect x="41" y="38" width="3.5" height="20" rx="1.5"/>
      <path d="M25 60 L43 60 L46 76 L22 76 Z"/>
    </svg>
  );
}

export function IshtalingaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <ellipse cx="30" cy="56" rx="20" ry="2.5" opacity="0.2"/>
      <path d="M14 52 L46 52 L44 56 L16 56 Z" opacity="0.85"/>
      <path d="M10 42 Q10 36 16 35 L44 35 Q50 36 50 42 Q50 48 44 49 L16 49 Q10 48 10 42 Z"/>
      <path d="M50 40 Q56 40 56 43 Q56 46 50 46 Z"/>
      <path d="M30 6 C22 6 18 16 18 24 C18 32 22 35 30 35 C38 35 42 32 42 24 C42 16 38 6 30 6 Z"/>
      <ellipse cx="25" cy="18" rx="3" ry="4" fill="white" opacity="0.25"/>
      <path d="M22 29 L38 29" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
      <path d="M21 31.5 L39 31.5" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
    </svg>
  );
}

export function AumVedicSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" style={style} aria-hidden="true">
      <path d="M10 40 L24 32 L38 40 Z" fill="currentColor" opacity="0.18" />
      <path d="M10 40 L38 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 8 C20 14, 18 18, 22 22 C20 24, 19 27, 22 30 C24 27, 26 25, 24 22 C28 18, 28 13, 24 8 Z" fill="currentColor" opacity="0.9" />
      <circle cx="24" cy="6" r="1.2" fill="currentColor" />
      <circle cx="20" cy="10" r="0.8" fill="currentColor" opacity="0.7" />
      <circle cx="28" cy="10" r="0.8" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function KhejriTreeSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M0 50 Q15 44 30 48 Q45 52 60 46 L60 60 L0 60 Z" opacity="0.45"/>
      <path d="M28 50 L28 28 Q27 22 30 20 Q33 22 32 28 L32 50 Z"/>
      <circle cx="30" cy="16" r="9"/>
      <circle cx="20" cy="20" r="7"/>
      <circle cx="40" cy="20" r="7"/>
      <circle cx="24" cy="12" r="5"/>
      <circle cx="36" cy="12" r="5"/>
    </svg>
  );
}

// ─── Canonical tradition list (single source of truth) ───────────────────────
// Order: Hindu / Jain / Sikh first (umbrella categories),
// then the remaining 11 sub-traditions alphabetically.
export const TRADITION_OPTIONS: { value: Tradition; label: string; accent: string }[] = [
  { value: "Hindu",            label: "Hindu",             accent: "#E07B2A" },
  { value: "Jain",             label: "Jain",              accent: "#16A34A" },
  { value: "Sikh",             label: "Sikh",              accent: "#003DA5" },
  { value: "AryaSamaj",        label: "Arya Samaj",        accent: "#9A3412" },
  { value: "Bishnoi",          label: "Bishnoi",           accent: "#16A34A" },
  { value: "ISKCON",           label: "ISKCON",            accent: "#0284C7" },
  { value: "Lingayat",         label: "Lingayat",          accent: "#111111" },
  { value: "PushtiMarg",       label: "Pushti Marg",       accent: "#0E7490" },
  { value: "Ramanandi",        label: "Ramanandi",         accent: "#B91C1C" },
  { value: "ShaivaSiddhanta",  label: "Shaiva Siddhanta",  accent: "#475569" },
  { value: "Shakta",           label: "Shakta",            accent: "#BE185D" },
  { value: "SriVaishnava",     label: "Sri Vaishnava",     accent: "#B45309" },
  { value: "Swaminarayan",     label: "Swaminarayan",      accent: "#C4972A" },
  { value: "Warkari",          label: "Warkari",           accent: "#DC6803" },
];

// ─── TraditionIcon — renders the canonical icon for any tradition ───────────
// Used for the icon badge above the dropdown on Home and Onboarding alike.
export function TraditionIcon({ tradition }: { tradition: Tradition }) {
  if (tradition === "Sikh")            return <KhandaSvg className="w-10 h-12" style={{ color: "#003DA5" }} />;
  if (tradition === "Jain")            return <JainSymbol className="w-10 h-12" style={{ color: "#15803D" }} />;
  if (tradition === "Hindu")           return <OmSymbol className="text-primary text-3xl" />;
  if (tradition === "Swaminarayan")    return <LotusSvg className="w-10 h-10" style={{ color: "#C4972A" }} />;
  if (tradition === "ISKCON")          return <IskconLogoSvg className="w-16 h-16" />;
  if (tradition === "Lingayat")        return <IshtalingaSvg className="w-11 h-11" style={{ color: "#111111" }} />;
  if (tradition === "PushtiMarg")      return <ShrinathjiSvg className="w-9 h-12" style={{ color: "#0E7490" }} />;
  if (tradition === "Warkari")         return <VitthalSvg className="w-9 h-12" style={{ color: "#DC6803" }} />;
  if (tradition === "Ramanandi")       return <UrdhvaPundraSvg className="w-11 h-11" />;
  if (tradition === "SriVaishnava")    return <NaamamSvg className="w-9 h-12" style={{ color: "#B45309" }} />;
  if (tradition === "Shakta")          return <SriYantraSvg className="w-11 h-11" style={{ color: "#BE185D" }} />;
  if (tradition === "ShaivaSiddhanta") return <TripundraSvg className="w-11 h-11" style={{ color: "#475569" }} />;
  if (tradition === "AryaSamaj")       return <AumVedicSvg className="w-11 h-11" style={{ color: "#9A3412" }} />;
  if (tradition === "Bishnoi")         return <KhejriTreeSvg className="w-11 h-11" style={{ color: "#16A34A" }} />;
  // "Both" or unknown — render the umbrella triad
  return (
    <>
      <OmSymbol className="text-primary text-3xl" />
      <JainSymbol className="text-green-600 w-7 h-9" />
      <KhandaSvg className="w-10 h-12" style={{ color: "#003DA5" }} />
    </>
  );
}

// ─── TraditionSwitcher — controlled dropdown identical to Home's selector ───
// `current` is the currently displayed tradition (label shown on the button).
// `onSelect` is called with the chosen tradition when the user picks one.
// This component is used identically by Home (writes to localStorage and reloads)
// and Onboarding (updates local React state during the onboarding flow).
export function TraditionSwitcher({
  current,
  onSelect,
}: {
  current: Tradition;
  onSelect: (t: Tradition) => void;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const currentLabel = TRADITION_OPTIONS.find((o) => o.value === current)?.label ?? current;

  function pick(t: Tradition) {
    setOpen(false);
    onSelect(t);
  }

  return (
    <div className="relative flex justify-center mt-1 mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full font-medium border transition-all active:opacity-70"
        style={{ background: "rgba(255,255,255,0.65)", borderColor: "#E5E7EB", color: "#78716C", fontSize: "17px" }}
        aria-label="Switch tradition"
        data-testid="tradition-switcher-button"
      >
        {currentLabel}
        <svg viewBox="0 0 10 10" className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={open ? "M1 7l4-4 4 4" : "M1 3l4 4 4-4"} />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-[52px] left-1/2 -translate-x-1/2 z-20 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden" style={{ minWidth: 220 }}>
            {TRADITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => pick(opt.value)}
                className="w-full text-left px-4 py-3 min-h-[44px] font-medium transition-colors active:bg-amber-50"
                style={{ color: opt.value === current ? "#E07B2A" : "#374151", background: opt.value === current ? "#FFF7ED" : "transparent", fontSize: "17px" }}
                data-testid={`tradition-option-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
