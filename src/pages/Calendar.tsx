import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, CheckCircle2, Circle } from "lucide-react";
import { getAllVratDates, formatDateStr, JAIN_ALWAYS_ALLOWED, JAIN_YEAR_ROUND_AVOIDED, getIskconRegionBucket } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";
import PageFooter from "@/components/PageFooter";
import NirjalaWarning from "@/components/NirjalaWarning";
import { getUserTradition, getObservedVrats, isVratObserved, getLocationInfo, getUserRegion, getUserLocation } from "@/hooks/useUserPrefs";
import VratKathaSection from "@/components/VratKathaSection";
import { addObservation, removeObservation, isObservedDate } from "@/hooks/useVratHistory";
import SankalpModal, { SankalpButton } from "@/components/SankalpModal";
import { useLanguage } from "@/contexts/LanguageContext";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function VratDetailSheet({
  dateStr,
  vrats,
  onClose,
}: {
  dateStr: string;
  vrats: Vrat[];
  onClose: () => void;
}) {
  const [activeVrat, setActiveVrat] = useState(vrats[0]);
  const isJain = activeVrat.tradition === "Jain";
  const isLingayat = activeVrat.tradition === "Lingayat";
  const todayStr = new Date().toISOString().split("T")[0];
  const canObserve = dateStr <= todayStr;
  const [observed, setObserved] = useState(() => isObservedDate(activeVrat.id, dateStr));

  const [showSankalp, setShowSankalp] = useState(false);

  useEffect(() => {
    setObserved(isObservedDate(activeVrat.id, dateStr));
    setShowSankalp(false);
  }, [activeVrat.id, dateStr]);

  function toggleObserved() {
    if (observed) {
      removeObservation(activeVrat.id, dateStr);
    } else {
      addObservation(activeVrat.id, dateStr);
    }
    setObserved((prev) => !prev);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" data-testid="vrat-detail-sheet">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-h-[85vh] bg-background rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header — green for Jain, blue for Lingayat, saffron for others */}
        <div
          className={(isJain || isLingayat) ? "px-6 pt-6 pb-5" : "saffron-gradient px-6 pt-6 pb-5"}
          style={
            isJain ? { background: "linear-gradient(135deg, #15803D 0%, #22C55E 100%)" } :
            isLingayat ? { background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)" } :
            undefined
          }
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-white/70 text-xs uppercase tracking-widest">
                  {formatDateStr(dateStr)}
                </p>
                {isJain && (
                  <span className="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Jain
                  </span>
                )}
                {activeVrat.regionLabel && (
                  <span className="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {activeVrat.regionLabel}
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl font-bold text-white">
                {activeVrat.name}
              </h2>
              {activeVrat.hinduEquivalent && (
                <p className="text-xs text-white/60 mt-0.5 italic">
                  Also observed as {activeVrat.hinduEquivalent}
                </p>
              )}
              {activeVrat.nirjala && (
                <div className="mt-1.5 mb-1">
                  <NirjalaWarning variant="light" />
                </div>
              )}
              <p className="text-white/80 text-sm mt-1">{activeVrat.deity}</p>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
              data-testid="close-detail-sheet"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {vrats.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {vrats.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVrat(v)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    activeVrat.id === v.id
                      ? "bg-white text-primary font-medium"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                  data-testid={`vrat-tab-${v.id}`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4" data-overscroll-contain style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            {activeVrat.description}
          </p>

          {/* Sankalp */}
          <SankalpButton
            vrat={activeVrat}
            onOpen={() => setShowSankalp(true)}
            isJain={isJain}
          />

          {/* Jain water & root veg reminder */}
          {isJain && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-xs font-semibold text-green-800 mb-1">🌿 Jain Fasting Essentials</p>
              <p className="text-xs text-green-700 leading-relaxed">
                Always use <strong>boiled water cooled to room temperature</strong> — never cold, never iced, never raw.
                Root vegetables (potato, carrot, onion, garlic, beetroot, radish) are avoided by practising Jains <strong>every single day</strong>, not just on fasting days.
              </p>
            </div>
          )}

          {/* Jain Panchang date disclaimer */}
          {isJain && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 flex gap-3">
              <span className="text-sky-500 flex-shrink-0 mt-0.5" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold text-sky-800 mb-0.5">Jain Panchang Dates</p>
                <p className="text-xs text-sky-700 leading-relaxed">
                  Dates follow the <strong>Jain Panchang (Veer Nirvana Samvat 2552)</strong>. Confirmed with{" "}
                  <a href="https://www.jainworld.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">jainworld.com</a>{" "}
                  and{" "}
                  <a href="https://www.festivaldays.in" target="_blank" rel="noopener noreferrer" className="underline font-medium">festivaldays.in</a>.
                  Dates may differ slightly from the Hindu Drik Panchang — please verify with your local Jain community.
                </p>
              </div>
            </div>
          )}

          {/* Mantra */}
          <div className={`rounded-2xl p-4 ${isJain ? "bg-green-50 border border-green-100" : "bg-accent/30"}`}>
            <p
              className={`font-serif text-lg text-center py-2 leading-loose whitespace-pre-line ${isJain ? "text-green-800" : "text-primary"}`}
              lang="hi"
              data-testid="mantra-text"
            >
              {activeVrat.mantra}
            </p>
            {activeVrat.mantraTransliteration && (
              <>
                <div className="h-px bg-green-200 my-2" />
                <p className="text-xs text-green-700 text-center font-medium whitespace-pre-line leading-relaxed">
                  {activeVrat.mantraTransliteration}
                </p>
              </>
            )}
            <div className="h-px bg-border my-2" />
            <p className="text-xs text-muted-foreground text-center italic leading-relaxed">
              {activeVrat.mantraTranslation}
            </p>
          </div>

          {/* Mantra how to recite + benefits */}
          {(activeVrat.mantraHow || activeVrat.mantraBenefits) && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-4 space-y-3">
              {activeVrat.mantraHow && (
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">🕯 How to recite</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{activeVrat.mantraHow}</p>
                </div>
              )}
              {activeVrat.mantraHow && activeVrat.mantraBenefits && (
                <div className="h-px bg-amber-200" />
              )}
              {activeVrat.mantraBenefits && (
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">✦ Benefits</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{activeVrat.mantraBenefits}</p>
                </div>
              )}
            </div>
          )}

          {/* Special note */}
          {activeVrat.specialNote && (
            <div className={`rounded-2xl px-4 py-3 border ${isJain ? "bg-amber-50 border-amber-200" : "bg-amber-50 border-amber-200"}`}>
              <p className="text-xs font-semibold text-amber-800 mb-1">✦ Special Note</p>
              <p className="text-xs text-amber-700 leading-relaxed">{activeVrat.specialNote}</p>
            </div>
          )}

          {/* Foods */}
          {isJain ? (
            <>
              <div>
                <h4 className="font-serif text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <span className="text-green-600">✓</span> Always Allowed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {JAIN_ALWAYS_ALLOWED.map((f, i) => (
                    <span key={i} className="text-xs bg-green-50 border border-green-100 text-green-700 px-2.5 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <span className="text-red-500">✗</span> Avoided Year-Round
                </h4>
                <div className="flex flex-wrap gap-2">
                  {JAIN_YEAR_ROUND_AVOIDED.map((f, i) => (
                    <span key={i} className="text-xs bg-red-50 border border-red-100 text-red-700 px-2.5 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
              {activeVrat.jainFastRestrictions && (
                <div>
                  <h4 className="font-serif text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1">
                    <span className="text-amber-600">⚑</span> Additional Restrictions on this Fast Day
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeVrat.jainFastRestrictions.map((f, i) => (
                      <span key={i} className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <h4 className="font-serif text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                  <span className="text-green-600">✓</span> Foods Allowed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeVrat.foodsAllowed.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-green-50 border border-green-100 text-green-700 px-2.5 py-1 rounded-full"
                      data-testid={`detail-allowed-${i}`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                  <span className="text-red-500">✗</span> Foods to Avoid
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeVrat.foodsAvoided.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-red-50 border border-red-100 text-red-700 px-2.5 py-1 rounded-full"
                      data-testid={`detail-avoided-${i}`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="bg-card border border-card-border rounded-2xl p-4">
            <h4 className="font-serif text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>🍽</span> Meal Idea
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{activeVrat.mealIdea}</p>
          </div>

          {canObserve && (
            <button
              onClick={toggleObserved}
              data-testid="observe-vrat-btn"
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${
                observed
                  ? "text-emerald-800 border-2 border-emerald-400"
                  : "text-white"
              }`}
              style={
                observed
                  ? { background: "rgba(16,185,129,0.10)" }
                  : { background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }
              }
              aria-pressed={observed}
            >
              {observed ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Observed ✓
                </>
              ) : (
                <>
                  <Circle size={18} />
                  I observed this vrat
                </>
              )}
            </button>
          )}

          <VratKathaSection vratId={activeVrat.id} vratName={activeVrat.name} />
        </div>
      </div>

      {showSankalp && (
        <SankalpModal vrat={activeVrat} onClose={() => setShowSankalp(false)} />
      )}
    </div>
  );
}

function CalendarGrid({
  year,
  month,
  vratDates,
  today,
  observedVrats,
  onDayClick,
}: {
  year: number;
  month: number;
  vratDates: Record<string, Vrat[]>;
  today: string;
  observedVrats: string[];
  onDayClick: (dateStr: string, vrats: Vrat[]) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const monthPad = String(month + 1).padStart(2, "0");
          const dayPad = String(day).padStart(2, "0");
          const dateStr = `${year}-${monthPad}-${dayPad}`;
          const vratsForDay = vratDates[dateStr];
          const isToday = dateStr === today;
          const isVratDay = !!vratsForDay;

          let dotColor = "";
          let isPersonal = false;
          if (isVratDay) {
            const v = vratsForDay[0];
            dotColor = v.color;
            isPersonal = vratsForDay.some((vr) => isVratObserved(vr.id, observedVrats));
          }

          return (
            <button
              key={dateStr}
              onClick={() => isVratDay && onDayClick(dateStr, vratsForDay)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${
                isToday
                  ? "bg-primary text-primary-foreground font-bold"
                  : isVratDay && isPersonal
                  ? "bg-amber-50 hover:bg-amber-100 cursor-pointer active:scale-95"
                  : isVratDay
                  ? "bg-accent/50 hover:bg-accent cursor-pointer active:scale-95"
                  : "text-foreground cursor-default"
              }`}
              data-testid={`calendar-day-${dateStr}`}
              disabled={!isVratDay}
              aria-label={isVratDay ? `${dateStr}: ${vratsForDay.map((v) => v.name).join(", ")}` : dateStr}
            >
              <span className={`text-sm leading-none ${isVratDay && !isToday ? "font-semibold text-foreground" : ""}`}>
                {day}
              </span>
              {isVratDay && (
                <span
                  className={`absolute bottom-1 rounded-full ${isPersonal ? "w-2 h-2" : "w-1.5 h-1.5"}`}
                  style={{
                    backgroundColor: isToday ? "white" : isPersonal ? "#D4A017" : dotColor,
                    opacity: isPersonal ? 1 : 0.75,
                    boxShadow: isPersonal && !isToday ? "0 0 3px #D4A01780" : "none",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type TraditionFilter = "all" | "hindu" | "jain" | "sikh" | "swaminarayan" | "iskcon" | "lingayat" | "pushtimarg" | "warkari" | "ramanandi" | "srivaishnava" | "shakta" | "shaivasiddhanta" | "bishnoi" | "aryasamaj";

const HINDU_LEGEND = [
  { label: "Ekadashi", color: "#D4A017" },
  { label: "Pradosh", color: "#7C3AED" },
  { label: "Purnima", color: "#C084FC" },
  { label: "Navratri", color: "#DC2626" },
  { label: "Sankashti", color: "#EA580C" },
  { label: "Amavasya", color: "#1E3A5F" },
  { label: "Pitru Paksha", color: "#374151" },
  { label: "Karva Chauth / Special", color: "#BE185D" },
];
const JAIN_LEGEND = [
  { label: "Jain Festivals", color: "#22C55E" },
  { label: "Shared (Purnima)", color: "#C084FC" },
];
const SIKH_LEGEND = [
  { label: "Gurpurabs & Observances", color: "#003DA5" },
  { label: "Sangrand (monthly)", color: "#003DA5" },
  { label: "Shaheedi Diwas (Martyrdom)", color: "#7F1D1D" },
];
const SWAMINARAYAN_LEGEND = [
  { label: "Swaminarayan Jayanti", color: "#C4972A" },
  { label: "Fuldol & Annakut", color: "#C4972A" },
  { label: "Ekadashi (Swaminarayan)", color: "#C4972A" },
];
const ISKCON_LEGEND = [
  { label: "Ekadashi (Vaishnava) · no grains", color: "#0284C7" },
  { label: "Gaura Purnima & Radhashtami", color: "#0284C7" },
  { label: "Janmashtami · Kartik month", color: "#0284C7" },
];
const LINGAYAT_LEGEND = [
  { label: "Ugadi · Kannada New Year", color: "#2563EB" },
  { label: "Maha Shivaratri · nirjala fast", color: "#2563EB" },
  { label: "Shravana Somavara (Mondays)", color: "#2563EB" },
  { label: "Basava Jayanti", color: "#2563EB" },
  { label: "Varamahalakshmi Vratam", color: "#2563EB" },
  { label: "Lakshmi Puja — Deepawali", color: "#2563EB" },
];
const PUSHTI_MARG_LEGEND = [
  { label: "Ekadashi · grain-free seva", color: "#0E7490" },
  { label: "Janmashtami · Chappan Bhog", color: "#0E7490" },
  { label: "Annakut · Govardhan Puja", color: "#0E7490" },
  { label: "Hindola Utsav · Phoolon wali Holi", color: "#0E7490" },
];
const WARKARI_LEGEND = [
  { label: "Ashadhi & Kartiki Ekadashi · Pandharpur Wari", color: "#DC6803" },
  { label: "Maghi Ekadashi (Jaya)", color: "#DC6803" },
  { label: "Tukaram Beej · Dehu", color: "#DC6803" },
  { label: "Dnyaneshwar Punyatithi · Alandi", color: "#DC6803" },
];
const RAMANANDI_LEGEND = [
  { label: "Ram Navami · Sri Ram's appearance", color: "#B91C1C" },
  { label: "Hanuman Jayanti · Sankat Mochan", color: "#B91C1C" },
  { label: "Sita Navami · Janaki Jayanti", color: "#B91C1C" },
  { label: "Vivah Panchami · Sita-Ram wedding", color: "#B91C1C" },
  { label: "Tulsi Vivah · Tulsi-Shaligram", color: "#B91C1C" },
];
const SRIVAISHNAVA_LEGEND = [
  { label: "Vaikuntha Ekadashi (Mukkoti)", color: "#B45309" },
  { label: "Adhyayana Utsavam · Tiruvaymozhi", color: "#B45309" },
  { label: "Ramanuja Jayanti · Tirunakshatram", color: "#B45309" },
  { label: "Pavitrotsavam · purification", color: "#B45309" },
  { label: "Brahmotsavam (Tirumala)", color: "#B45309" },
];
const SHAKTA_LEGEND = [
  { label: "Sharadiya Navaratri · Bengali Durga Puja", color: "#BE185D" },
  { label: "Maha Ashtami · Sandhi Puja", color: "#BE185D" },
  { label: "Lakshmi Puja (Kojagari)", color: "#BE185D" },
  { label: "Kali Puja · Karthik Amavasya", color: "#BE185D" },
  { label: "Chaitra Navaratri · Spring", color: "#BE185D" },
];
const SHAIVA_SIDDHANTA_LEGEND = [
  { label: "Maha Shivaratri · 4-prahar abhishekam", color: "#475569" },
  { label: "Pradosha · Trayodashi sunset", color: "#475569" },
  { label: "Aarudra Darshan · Nataraja", color: "#475569" },
  { label: "Karthigai Deepam · Thiruvannamalai", color: "#475569" },
  { label: "Skanda Shashti · Soorasamharam", color: "#475569" },
];
const BISHNOI_LEGEND = [
  { label: "Guru Jambheshwar Jayanti · Jambhoji's birth", color: "#16A34A" },
  { label: "Khejarli Shaheed Diwas · Amrita Devi & 363", color: "#16A34A" },
  { label: "Jambhoji Mukti Diwas · Lalasar Sathari", color: "#16A34A" },
  { label: "Mukam Mela · Asoj & Phalgun Amavasya", color: "#16A34A" },
];

export default function Calendar() {
  const { t } = useLanguage();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(today.getFullYear() === 2026 ? today.getMonth() : 0);
  const [selected, setSelected] = useState<{ dateStr: string; vrats: Vrat[] } | null>(null);
  const [filter, setFilter] = useState<TraditionFilter>(() => {
    const trad = getUserTradition();
    if (trad === "Hindu")            return "hindu";
    if (trad === "Jain")             return "jain";
    if (trad === "Sikh")             return "sikh";
    if (trad === "Swaminarayan")     return "swaminarayan";
    if (trad === "ISKCON")           return "iskcon";
    if (trad === "Lingayat")         return "lingayat";
    if (trad === "PushtiMarg")       return "pushtimarg";
    if (trad === "Warkari")          return "warkari";
    if (trad === "Ramanandi")        return "ramanandi";
    if (trad === "SriVaishnava")     return "srivaishnava";
    if (trad === "Shakta")           return "shakta";
    if (trad === "ShaivaSiddhanta")  return "shaivasiddhanta";
    if (trad === "Bishnoi")          return "bishnoi";
    if (trad === "AryaSamaj")        return "aryasamaj";
    return "all";
  });
  const [observedVrats] = useState<string[]>(() => getObservedVrats());

  const userRegion = getUserRegion();
  const userLocation = getUserLocation();
  const iskconBucket = getIskconRegionBucket(userLocation, userRegion);
  const allVratDates = getAllVratDates(iskconBucket);
  // Indian-region tags on vrats (maharashtra, gujarat, etc.) are only meaningful
  // when the user is in India. For US/UK/AU users, show all regional vrats so
  // diaspora users see vrats from every Indian region by default.
  const regionFilterActive = userLocation === "india" && userRegion !== "all";

  const filteredVratDates = allVratDates
    .map(({ date, vrats }) => ({
      date,
      vrats: vrats.filter((v) => {
        const traditionOk =
          filter === "all" ||
          (filter === "hindu"        && (v.tradition === "Hindu" || v.tradition === "Both")) ||
          (filter === "jain"         && (v.tradition === "Jain"  || v.tradition === "Both")) ||
          (filter === "sikh"         && v.tradition === "Sikh") ||
          (filter === "swaminarayan" && v.tradition === "Swaminarayan") ||
          (filter === "iskcon"       && v.tradition === "ISKCON") ||
          (filter === "lingayat"        && v.tradition === "Lingayat") ||
          (filter === "pushtimarg"      && v.tradition === "PushtiMarg") ||
          (filter === "warkari"         && v.tradition === "Warkari") ||
          (filter === "ramanandi"       && v.tradition === "Ramanandi") ||
          (filter === "srivaishnava"    && v.tradition === "SriVaishnava") ||
          (filter === "shakta"          && v.tradition === "Shakta") ||
          (filter === "shaivasiddhanta" && v.tradition === "ShaivaSiddhanta") ||
          (filter === "bishnoi"         && v.tradition === "Bishnoi") ||
          (filter === "aryasamaj"       && v.tradition === "AryaSamaj");
        const regionOk = !v.region || !regionFilterActive || v.region === userRegion;
        return traditionOk && regionOk;
      }),
    }))
    .filter(({ vrats }) => vrats.length > 0);

  const vratDateMap: Record<string, Vrat[]> = {};
  for (const { date, vrats } of filteredVratDates) {
    vratDateMap[date] = vrats;
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const vratCountThisMonth = Object.keys(vratDateMap).filter((d) => {
    const [y, m] = d.split("-").map(Number);
    return y === viewYear && m - 1 === viewMonth;
  }).length;

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="text-center mb-4">
          <h1 className="font-serif text-2xl font-bold text-foreground">{t("nav.calendar")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            2026–2027 — Tap any highlighted date
          </p>
        </div>

        <div className="vrat-card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors active:scale-95"
              data-testid="prev-month"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center">
              <h2 className="font-serif text-xl font-semibold text-foreground" data-testid="calendar-month-label">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              {vratCountThisMonth > 0 && (
                <p className="text-xs text-primary mt-0.5">
                  {vratCountThisMonth} fast {vratCountThisMonth === 1 ? "day" : "days"} this month
                </p>
              )}
            </div>

            <button
              onClick={nextMonth}
              className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors active:scale-95"
              data-testid="next-month"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            vratDates={vratDateMap}
            today={todayStr}
            observedVrats={observedVrats}
            onDayClick={(dateStr, vrats) => setSelected({ dateStr, vrats })}
          />
        </div>

        <div className="vrat-card p-4 mb-4">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
            Legend
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 col-span-2 pb-2 mb-1 border-b border-stone-100">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#D4A017", boxShadow: "0 0 4px #D4A01780" }}
              />
              <span className="text-xs font-medium text-foreground">Your observed vrats (gold)</span>
            </div>
            {(filter === "jain" ? JAIN_LEGEND : filter === "sikh" ? SIKH_LEGEND : filter === "swaminarayan" ? SWAMINARAYAN_LEGEND : filter === "iskcon" ? ISKCON_LEGEND : filter === "lingayat" ? LINGAYAT_LEGEND : filter === "pushtimarg" ? PUSHTI_MARG_LEGEND : filter === "warkari" ? WARKARI_LEGEND : filter === "ramanandi" ? RAMANANDI_LEGEND : filter === "srivaishnava" ? SRIVAISHNAVA_LEGEND : filter === "shakta" ? SHAKTA_LEGEND : filter === "shaivasiddhanta" ? SHAIVA_SIDDHANTA_LEGEND : filter === "bishnoi" ? BISHNOI_LEGEND : filter === "hindu" ? HINDU_LEGEND : [...HINDU_LEGEND, ...JAIN_LEGEND]).map((item) => (
              <div key={item.label} className="flex items-center gap-2" data-testid={`legend-${item.label}`}>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 text-center">
          {(() => {
            const loc = getLocationInfo();
            const trad = getUserTradition();
            if (trad === "Sikh") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow the Nanakshahi Sikh calendar. Local Gurdwara observances may vary — please verify with your local Gurdwara.
                </p>
              );
            }
            if (trad === "Jain") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST. Regional dates may vary — please verify with your local Jain community.
                </p>
              );
            }
            if (trad === "Swaminarayan") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST. Swaminarayan observance dates may vary slightly between sampradays (BAPS, Swaminarayan Gadi, Nar Narayan Dev Gadi) — please verify with your local mandir.
                </p>
              );
            }
            if (trad === "ISKCON") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST. ISKCON uses a Vaishnava calendar — Ekadashi and festival dates may occasionally fall one day after the standard Hindu Panchang. Always verify with your local ISKCON temple's published Vaishnava calendar.
                </p>
              );
            }
            if (trad === "Lingayat") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST. Shravana Somavara dates are for the holy month of Shravana. Basava Jayanti falls on Vaishakha Shukla Tritiya — please verify with your local Lingayat community or mathadipati.
                </p>
              );
            }
            if (trad === "PushtiMarg") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Vikram Samvat (Drik Panchang IST). Pushti Marg is a seva-based tradition — consult your local haveli or Vaishnava Panchang for exact Utsav dates, as the Hindola Utsav dates and specific Chappan Bhog timing may vary by haveli tradition.
                </p>
              );
            }
            if (trad === "Warkari") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST. Pandharpur Wari (Ashadhi & Kartiki Ekadashi) draws lakhs of warkaris on foot to Vitthal-Rakhumai. Verify Tukaram Beej and Dnyaneshwar Punyatithi with the Sansthan at Dehu/Alandi.
                </p>
              );
            }
            if (trad === "Ramanandi") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST. Ramanandi observances center on Ayodhya, Janakpur and Chitrakoot. Tulsi Vivah and Vivah Panchami timings can vary slightly by Akhara — verify with your local Mahant.
                </p>
              );
            }
            if (trad === "SriVaishnava") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST. Vaikuntha Ekadashi and Adhyayana Utsavam are observed at Srirangam and other Divya Desams. Brahmotsavam (Tirumala) and Pavitrotsavam dates depend on temple-specific Pancharatra/Vaikhanasa Agama — verify with TTD or your kshetram.
                </p>
              );
            }
            if (trad === "Shakta") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST. Bengali Shakta tradition observes Sandhi Puja in a precise 48-minute window between Ashtami and Navami tithis — verify exact muhurta with your local Purohit. Kali Puja is observed on Karthik Amavasya (same night as Diwali).
                </p>
              );
            }
            if (trad === "ShaivaSiddhanta") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST (Tamil calendar). Aarudra Darshan is the Tiruvathirai nakshatra in Margazhi (Dec–Jan) at Chidambaram. Karthigai Deepam is Krittika nakshatra in Karthikai. Verify Skanda Shashti with Tiruchendur or your local Murugan kovil.
                </p>
              );
            }
            if (trad === "Bishnoi") {
              return (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dates follow Drik Panchang IST (Marwari/Bishnoi reckoning). Guru Jambheshwar Jayanti falls on Bhadrapada Krishna Ashtami (the same tithi as Krishna Janmashtami). Khejarli Shaheed Diwas is Bhadrapada Shukla Dashami — the historical date by Gregorian was September 12, 1730. Two Mukam Melas are held annually — Asoj Amavasya (autumn, the larger) and Phalgun Amavasya (spring). Verify with the Akhil Bharatiya Bishnoi Mahasabha or your village Bishnoi sabha.
                </p>
              );
            }
            return (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {loc.id === "india"
                  ? "Dates follow Drik Panchang IST. Regional dates may vary — please verify with your local pandit or family tradition."
                  : `Dates shown per Drik Panchang IST (${loc.flag} ${loc.label} · ${loc.timezone}). ${loc.note}`}
              </p>
            );
          })()}
        </div>

        <PageFooter />
      </div>

      {selected && (
        <VratDetailSheet
          dateStr={selected.dateStr}
          vrats={selected.vrats}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
