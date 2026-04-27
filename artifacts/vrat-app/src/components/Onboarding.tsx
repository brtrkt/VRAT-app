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
const VRAT_OPTIONS: { id: string; label: string; subtitle: string; tradition: "Hindu" | "Jain" | "Sikh" | "Swaminarayan" | "ISKCON" }[] = [
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
  { id: "swaminarayan-jayanti",        label: "Swaminarayan Jayanti",  subtitle: "Chaitra Shukla Navami · Lord Swaminarayan's birth",    tradition: "Swaminarayan" },
  { id: "fuldol-swaminarayan",         label: "Fuldol",                subtitle: "Phalgun Purnima · flower festival before Holi",        tradition: "Swaminarayan" },
  { id: "annakut-swaminarayan",        label: "Annakut",               subtitle: "Day after Diwali · Swaminarayan New Year offering",    tradition: "Swaminarayan" },
  { id: "ekadashi-swaminarayan-jan-1", label: "Swaminarayan Ekadashi", subtitle: "Ekadashi with strict satvik fast · no onion, garlic", tradition: "Swaminarayan" },
  { id: "iskcon-ekadashi",       label: "Ekadashi (Vaishnava)",  subtitle: "No grains · 24 days a year · Parana next morning",    tradition: "ISKCON" },
  { id: "janmashtami-iskcon",    label: "Janmashtami",           subtitle: "Midnight fast · Lord Krishna's appearance day",        tradition: "ISKCON" },
  { id: "gaura-purnima",         label: "Gaura Purnima",         subtitle: "Sri Chaitanya Mahaprabhu's appearance day",            tradition: "ISKCON" },
  { id: "radhashtami",           label: "Radhashtami",           subtitle: "Srimati Radharani's appearance day",                   tradition: "ISKCON" },
  { id: "kartik-damodara",       label: "Kartik Damodara Month", subtitle: "Month-long vow · daily ghee lamp offering",            tradition: "ISKCON" },
  { id: "nityananda-trayodashi", label: "Nityananda Trayodashi", subtitle: "Sri Nityananda Prabhu's appearance day",               tradition: "ISKCON" },
];

const HINDU_DEFAULTS        = ["ekadashi", "purnima", "pradosh"];
const JAIN_DEFAULTS         = ["paryushana", "navpad-oli", "samvatsari"];
const SIKH_DEFAULTS         = ["guru-nanak-gurpurab", "baisakhi-sikh", "sangrand"];
const BOTH_DEFAULTS         = ["ekadashi", "purnima", "pradosh", "paryushana", "navpad-oli"];
const SWAMINARAYAN_DEFAULTS = ["swaminarayan-jayanti", "fuldol-swaminarayan", "ekadashi-swaminarayan-jan-1"];
const ISKCON_DEFAULTS       = ["iskcon-ekadashi", "janmashtami-iskcon", "gaura-purnima", "radhashtami"];

function defaultsForTradition(t: Tradition): string[] {
  if (t === "Hindu")        return HINDU_DEFAULTS;
  if (t === "Jain")         return JAIN_DEFAULTS;
  if (t === "Sikh")         return SIKH_DEFAULTS;
  if (t === "Swaminarayan") return SWAMINARAYAN_DEFAULTS;
  if (t === "ISKCON")       return ISKCON_DEFAULTS;
  return BOTH_DEFAULTS;
}

// ─── SVG Symbols ─────────────────────────────────────────────────────────────
function VaishnavaTilakSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 72" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M24 4 C12 4 8 16 8 28 L8 68 L16 68 L16 32 C16 20 19 12 24 12 C29 12 32 20 32 32 L32 68 L40 68 L40 28 C40 16 36 4 24 4 Z" />
      <ellipse cx="24" cy="38" rx="5" ry="10" fill="white" opacity="0.9" />
    </svg>
  );
}

function LotusSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <ellipse cx="30" cy="16" rx="6" ry="12" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(45 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(90 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(135 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(180 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(225 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(270 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(315 30 30)" opacity="0.85" />
      <circle cx="30" cy="30" r="8" />
    </svg>
  );
}

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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 838" className={className} style={style} aria-hidden="true">
      <path d="M 382.877 20.123 C 369.559 30.822, 345.376 45.962, 330.750 52.758 L 324 55.895 324 60.716 C 324 63.367, 325.121 70.478, 326.491 76.518 C 330.918 96.036, 331.246 95.385, 314.461 100.337 C 256.870 117.327, 191.500 172.746, 164.465 227.500 C 128.787 299.759, 133.953 392.025, 177.399 458.500 C 205.721 501.836, 258.627 543.384, 305.275 558.925 C 319.415 563.636, 319.789 564.487, 315.501 582.186 C 311.341 599.359, 309.421 597.713, 335.145 599.034 C 362.888 600.459, 359.904 596.918, 363.140 632.263 C 364.614 648.366, 366.925 648.221, 339.819 633.723 C 252.035 586.770, 204.974 549.771, 163.695 495.259 C 67.338 368.009, 85.097 234.198, 213 123.764 C 234.742 104.992, 234.667 103.873, 212.041 109.559 C 110.139 135.170, 38.463 217.919, 19.001 332.424 C -3.183 462.948, 77.786 612.592, 213.874 692.578 C 223.306 698.122, 229.221 704.156, 231.270 710.324 C 233.906 718.262, 236.150 716.989, 261 693.454 C 278.715 676.677, 287.385 669.523, 297.935 662.980 L 306.023 657.964 315.262 664.154 C 330.925 674.649, 347.391 686.178, 349.711 688.277 C 352.765 691.038, 351.984 692.143, 339.263 703.039 C 313.054 725.490, 308.858 729.378, 303.067 736.577 C 282.832 761.731, 290.623 784.971, 319.300 784.994 C 330.385 785.004, 333.416 782.872, 342.754 768.500 C 346.597 762.584, 352.819 754.927, 357.990 749.750 C 373.817 733.904, 377.458 740.437, 362.850 758.470 C 333.229 795.033, 383.820 841.515, 416.786 808.026 C 431.330 793.250, 431.601 775.970, 417.578 757.500 C 411.168 749.057, 410 746.910, 410 743.566 C 410 734.605, 425.868 749.290, 441.223 772.463 C 451.449 787.894, 469.510 790.098, 482.357 777.483 C 498.744 761.393, 491.697 745.849, 452.882 712.466 C 432.026 694.528, 428.655 691.121, 430.072 689.413 C 430.659 688.706, 441.041 681.316, 453.142 672.992 L 475.144 657.858 482.035 661.952 C 491.830 667.771, 501.058 675.358, 520.523 693.600 C 544.940 716.481, 546.929 717.777, 549.146 712.250 C 553.075 702.455, 555.873 699.765, 573.512 688.823 C 660.606 634.799, 723.719 555.962, 752.815 464.849 C 802.830 308.231, 705.681 131.137, 556.250 106.524 C 547.729 105.121, 550.304 108.484, 571.500 126.448 C 654.376 196.686, 688.599 278.271, 674.504 372 C 661.836 456.236, 588.780 548.821, 488.500 607.724 C 467.194 620.239, 420.825 645, 418.695 645 C 417.216 645, 419.673 608.756, 421.553 602.832 C 422.335 600.370, 423.498 600.193, 446.302 599.048 C 471.150 597.801, 470.002 598.724, 466.055 583.167 C 461.173 563.920, 460.979 564.315, 478.486 557.960 C 610.741 509.951, 674.863 366.463, 621.629 237.646 C 598.393 181.420, 529.902 119.704, 470.500 101.468 C 453.923 96.379, 453.151 96.050, 452.427 93.771 C 452.076 92.664, 453.259 84.451, 455.056 75.521 C 458.967 56.086, 459.278 57.164, 448.152 51.576 C 432.526 43.728, 411.049 30.140, 398.803 20.352 C 390.615 13.808, 390.737 13.809, 382.877 20.123 M 329.723 164.487 C 173.505 220.082, 164.045 413.813, 313.840 489.732 C 335.376 500.647, 334.660 501.050, 339.953 475 C 353.029 410.637, 357.976 316.778, 352.180 243 C 345.822 162.064, 344.963 159.063, 329.723 164.487 M 438.720 164.138 C 433.355 172.743, 426.995 257.397, 427.010 320 C 427.027 389.999, 430.285 424.681, 441.616 475.500 C 447.333 501.142, 445.886 499.900, 461.500 492.567 C 615.210 420.383, 612.274 229.328, 456.490 166.524 C 444.255 161.592, 440.613 161.102, 438.720 164.138" fill="currentColor" fillRule="evenodd" stroke="none" />
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
    tradition === "Hindu"        ? VRAT_OPTIONS.filter((v) => v.tradition === "Hindu") :
    tradition === "Jain"         ? VRAT_OPTIONS.filter((v) => v.tradition === "Jain") :
    tradition === "Sikh"         ? VRAT_OPTIONS.filter((v) => v.tradition === "Sikh") :
    tradition === "Swaminarayan" ? VRAT_OPTIONS.filter((v) => v.tradition === "Swaminarayan") :
    tradition === "ISKCON"       ? VRAT_OPTIONS.filter((v) => v.tradition === "ISKCON") :
    VRAT_OPTIONS.filter((v) => v.tradition === "Hindu" || v.tradition === "Jain");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ width: `${TOTAL_STEPS * 100}%`, transform: `translateX(-${(step * 100) / TOTAL_STEPS}%)` }}
      >
        {/* ── Screen 1: Welcome ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col items-center justify-between px-6 pb-10 safe-top"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #C86B1A 0%, #E07B2A 50%, #D97706 100%)" }}
        >
          <div />

          {/* Title */}
          <div className="text-center text-white w-full max-w-xs">
            <h1 className="font-serif text-6xl font-bold mb-2 tracking-tight" style={{ color: "#FEF9EC" }}>
              VRAT
            </h1>
            <p className="text-2xl font-serif font-semibold mb-1" style={{ color: "#FDE68A" }}>
              Your fast. Your way.
            </p>
            <p className="text-sm leading-relaxed mb-8 opacity-85" style={{ color: "#FEF3E2" }}>
              Tap your tradition to begin
            </p>

            {/* ── Tradition selector cards ── */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Hindu */}
              <button
                onClick={() => { chooseTradition("Hindu"); setStep(2); }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 px-2 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <OmSvg className="w-14 h-14 text-amber-100" />
                <span className="text-xs font-semibold tracking-wide" style={{ color: "#FEF9EC" }}>Hindu</span>
              </button>

              {/* Jain */}
              <button
                onClick={() => { chooseTradition("Jain"); setStep(2); }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 px-2 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <JainHandSvg className="w-10 h-14 text-amber-100" />
                <span className="text-xs font-semibold tracking-wide" style={{ color: "#FEF9EC" }}>Jain</span>
              </button>

              {/* Sikh */}
              <button
                onClick={() => { chooseTradition("Sikh"); setStep(2); }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 px-2 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <KhandaSvg className="w-14 h-14" style={{ color: "#7EC8F0" }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: "#FEF9EC" }}>Sikh</span>
              </button>

              {/* Swaminarayan */}
              <button
                onClick={() => { chooseTradition("Swaminarayan"); setStep(2); }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 px-2 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <LotusSvg className="w-14 h-14" style={{ color: "#F4D58D" }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: "#FEF9EC" }}>Swaminarayan</span>
              </button>

              {/* ISKCON — full-width */}
              <button
                onClick={() => { chooseTradition("ISKCON"); setStep(2); }}
                className="col-span-2 flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <VaishnavaTilakSvg className="w-7 h-10" style={{ color: "#7EC8F0" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>ISKCON / Vaishnava</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>Hare Krishna · Ekadashi · Gaura Purnima</span>
                </div>
              </button>
            </div>

            {/* Both / Hindu+Jain option */}
            <button
              onClick={() => { chooseTradition("Both"); setStep(2); }}
              className="mt-3 w-full py-3 rounded-2xl text-xs font-semibold tracking-wide transition-opacity active:opacity-70"
              style={{ background: "rgba(255,255,255,0.10)", color: "#FDE68A", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Hindu + Jain
            </button>
          </div>

          <StepDots total={TOTAL_STEPS} current={0} />
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
                  {
                    value: "Swaminarayan" as Tradition,
                    label: "Swaminarayan",
                    subtitle: "Jayanti, Fuldol, Annakut and strict Ekadashi",
                    icon: <LotusSvg className="w-12 h-12" style={{ color: "#C4972A" }} />,
                    accent: "#C4972A",
                  },
                  {
                    value: "ISKCON" as Tradition,
                    label: "ISKCON / Vaishnava",
                    subtitle: "Ekadashi (no grains), Gaura Purnima, Janmashtami, Kartik",
                    icon: <VaishnavaTilakSvg className="w-10 h-14" style={{ color: "#0284C7" }} />,
                    accent: "#0284C7",
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
