import { useLanguage } from "@/contexts/LanguageContext";

// ─── Tithi calculation ─────────────────────────────────────────────────────────
// Reference: Amavasya (New Moon) on Jan 29, 2026 IST
const REF_AMAVASYA = new Date("2026-01-29T00:00:00+05:30").getTime();
const LUNAR_MONTH_MS = 29.53059 * 24 * 60 * 60 * 1000;

// ─── Nakshatra calculation ─────────────────────────────────────────────────────
// Reference: Magha Purnima Jan 13, 2026 = Moon in Magha nakshatra (index 9)
const REF_NAKSHATRA_DATE = new Date("2026-01-13T00:00:00+05:30").getTime();
const REF_NAKSHATRA_IDX = 9;
const SIDEREAL_MONTH_MS = 27.32166 * 24 * 60 * 60 * 1000;
const NAKSHATRA_MS = SIDEREAL_MONTH_MS / 27;

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

function getTodayPanchang(now: Date): {
  tithi: string;
  paksha: string;
  tithiNum: number;
  nakshatra: string;
  isSpecial: boolean;
  specialLabel: string;
} {
  const ms = now.getTime();

  // Tithi
  const diffFromAmavasya = ms - REF_AMAVASYA;
  const lunarAge = ((diffFromAmavasya % LUNAR_MONTH_MS) + LUNAR_MONTH_MS) % LUNAR_MONTH_MS;
  const tithiFloat = (lunarAge / LUNAR_MONTH_MS) * 30;
  const tithiIdx = Math.floor(tithiFloat) % 30;
  const tithi = TITHI_NAMES[tithiIdx];
  const tithiNum = tithiIdx + 1;
  const paksha = tithiNum <= 15 ? "Shukla" : "Krishna";

  // Nakshatra
  const daysSinceRef = (ms - REF_NAKSHATRA_DATE) / NAKSHATRA_MS;
  const nakshatraIdx = Math.floor(((REF_NAKSHATRA_IDX + daysSinceRef) % 27 + 27)) % 27;
  const nakshatra = NAKSHATRA_NAMES[nakshatraIdx];

  // Special tithis
  const isSpecial = [1, 4, 8, 11, 14, 15, 30].includes(tithiNum);
  const specialMap: Record<number, string> = {
    11: "Ekadashi — fasting day",
    15: "Purnima — full moon",
    30: "Amavasya — new moon",
    4: "Chaturthi — Lord Ganesha",
    8: "Ashtami — Goddess Durga",
    14: "Chaturdashi — Lord Shiva",
    1: "Pratipada — auspicious start",
  };
  const specialLabel = specialMap[tithiNum] ?? "";

  return { tithi, paksha, tithiNum, nakshatra, isSpecial, specialLabel };
}

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
        {/* Tithi */}
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: "rgba(212,160,23,0.09)" }}
        >
          <p className="text-xs text-amber-600 font-medium mb-0.5">Tithi</p>
          <p className="font-serif text-base font-bold text-amber-900">{tithi}</p>
        </div>

        {/* Nakshatra */}
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
