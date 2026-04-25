import { useLanguage } from "@/contexts/LanguageContext";
import panchangData from "@/data/panchangData.json";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PanchangEntry {
  tithi: string;
  paksha: string;
  nakshatra: string;
  special?: string;
}

const lookup = panchangData as Record<string, PanchangEntry>;

// ─── Fallback approximation (used when date not in lookup table) ───────────────
const REF_AMAVASYA = new Date("2026-01-29T00:00:00+05:30").getTime();
const LUNAR_MONTH_MS = 29.53059 * 24 * 60 * 60 * 1000;
const REF_NAKSHATRA_DATE = new Date("2026-01-29T12:36:00+00:00").getTime();
const REF_NAKSHATRA_IDX = 22; // Dhanishtha
const NAKSHATRA_MS = (27.32166 / 27) * 24 * 60 * 60 * 1000;

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

function getApproximatePanchang(ms: number): PanchangEntry {
  const diffFromAmavasya = ms - REF_AMAVASYA;
  const lunarAge = ((diffFromAmavasya % LUNAR_MONTH_MS) + LUNAR_MONTH_MS) % LUNAR_MONTH_MS;
  const tithiIdx = Math.floor((lunarAge / LUNAR_MONTH_MS) * 30) % 30;
  const tithi = TITHI_NAMES[tithiIdx];
  const paksha = tithiIdx < 15 ? "Shukla" : "Krishna";
  const nakshatraFloat = REF_NAKSHATRA_IDX + (ms - REF_NAKSHATRA_DATE) / NAKSHATRA_MS;
  const nakshatra = NAKSHATRA_NAMES[Math.floor(((nakshatraFloat % 27) + 27)) % 27];
  return { tithi, paksha, nakshatra };
}

// ─── Main lookup ───────────────────────────────────────────────────────────────
function getTodayPanchang(now: Date): PanchangEntry & {
  tithiNum: number;
  isSpecial: boolean;
  specialLabel: string;
  fromLookup: boolean;
} {
  // Always resolve the date in IST (Asia/Kolkata) regardless of device timezone
  const dateKey = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const entry = lookup[dateKey] ?? getApproximatePanchang(now.getTime());
  const fromLookup = !!lookup[dateKey];

  const tithiNum = TITHI_NAMES.indexOf(entry.tithi) + 1 || 1;

  const isSpecial = [1, 4, 8, 11, 14, 15, 30].includes(tithiNum) ||
    entry.tithi === "Amavasya" || entry.tithi === "Purnima";

  const specialMap: Record<string, string> = {
    "Ekadashi":    "Ekadashi — fasting day",
    "Purnima":     "Purnima — full moon",
    "Amavasya":    "Amavasya — new moon",
    "Chaturthi":   "Chaturthi — Lord Ganesha",
    "Ashtami":     "Ashtami — Goddess Durga",
    "Chaturdashi": "Chaturdashi — Lord Shiva",
    "Pratipada":   "Pratipada — auspicious start",
  };
  const specialLabel = entry.special ?? specialMap[entry.tithi] ?? "";
  const isSpecialFinal = isSpecial || !!entry.special;

  return { ...entry, tithiNum, isSpecial: isSpecialFinal, specialLabel, fromLookup };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PanchangCard() {
  const { t } = useLanguage();
  const now = new Date();
  const { tithi, paksha, nakshatra, isSpecial, specialLabel } = getTodayPanchang(now);

  const pakshaDot = paksha === "Shukla" ? "#F5A623" : "#7B6EAA";
  const pakshaLabel = paksha === "Shukla" ? "Shukla Paksha ☀️" : "Krishna Paksha 🌑";

  return (
    <div
      className="rounded-3xl p-5 mb-4"
      data-testid="panchang-card"
      style={{
        background: "linear-gradient(135deg, #FEFCE8 0%, #FFF9F0 100%)",
        border: "1px solid rgba(212,160,23,0.22)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium tracking-widest uppercase text-amber-700">
          {t("home.panchangTitle")}
        </p>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: `${pakshaDot}22`, color: pakshaDot }}
        >
          {pakshaLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: "rgba(212,160,23,0.09)" }}
        >
          <p className="text-xs text-amber-600 font-medium mb-0.5">Tithi</p>
          <p className="font-serif text-base font-bold text-amber-900">{tithi}</p>
        </div>

        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: "rgba(124,98,53,0.08)" }}
        >
          <p className="text-xs text-amber-600 font-medium mb-0.5">Nakshatra</p>
          <p className="font-serif text-base font-bold text-amber-900 leading-tight">{nakshatra}</p>
        </div>
      </div>

      {isSpecial && specialLabel && (
        <div
          className="mt-3 px-4 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: "rgba(224,123,42,0.10)" }}
        >
          <span className="text-sm" aria-hidden="true">🪔</span>
          <p className="text-xs font-medium text-amber-800">{specialLabel}</p>
        </div>
      )}

      <p className="text-xs text-amber-600/50 mt-3 text-right">
        Approximate · based on lunar calendar
      </p>
    </div>
  );
}
