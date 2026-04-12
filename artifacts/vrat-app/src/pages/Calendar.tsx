import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getAllVratDates, formatDateStr } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";

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

  return (
    <div className="fixed inset-0 z-50 flex items-end" data-testid="vrat-detail-sheet">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-h-[85vh] bg-background rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header — green for Jain, saffron for Hindu */}
        <div
          className={isJain ? "px-6 pt-6 pb-5" : "saffron-gradient px-6 pt-6 pb-5"}
          style={isJain ? { background: "linear-gradient(135deg, #15803D 0%, #22C55E 100%)" } : undefined}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white/70 text-xs uppercase tracking-widest">
                  {formatDateStr(dateStr)}
                </p>
                {isJain && (
                  <span className="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Jain
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl font-bold text-white">
                {activeVrat.name}
              </h2>
              <p className="text-white/80 text-sm mt-1">{activeVrat.deity}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
              data-testid="close-detail-sheet"
              aria-label="Close"
            >
              <X size={16} />
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

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            {activeVrat.description}
          </p>

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

          {/* Special note */}
          {activeVrat.specialNote && (
            <div className={`rounded-2xl px-4 py-3 border ${isJain ? "bg-amber-50 border-amber-200" : "bg-amber-50 border-amber-200"}`}>
              <p className="text-xs font-semibold text-amber-800 mb-1">✦ Special Note</p>
              <p className="text-xs text-amber-700 leading-relaxed">{activeVrat.specialNote}</p>
            </div>
          )}

          {/* Foods */}
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

          <div className="bg-card border border-card-border rounded-2xl p-4">
            <h4 className="font-serif text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>🍽</span> Meal Idea
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{activeVrat.mealIdea}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarGrid({
  year,
  month,
  vratDates,
  today,
  onDayClick,
}: {
  year: number;
  month: number;
  vratDates: Record<string, Vrat[]>;
  today: string;
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
          if (isVratDay) {
            const v = vratsForDay[0];
            dotColor = v.color;
          }

          return (
            <button
              key={dateStr}
              onClick={() => isVratDay && onDayClick(dateStr, vratsForDay)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${
                isToday
                  ? "bg-primary text-primary-foreground font-bold"
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
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isToday ? "white" : dotColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type TraditionFilter = "all" | "hindu" | "jain";

const FILTER_LABELS: { value: TraditionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hindu", label: "Hindu" },
  { value: "jain", label: "Jain" },
];

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

export default function Calendar() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(today.getFullYear() === 2026 ? today.getMonth() : 0);
  const [selected, setSelected] = useState<{ dateStr: string; vrats: Vrat[] } | null>(null);
  const [filter, setFilter] = useState<TraditionFilter>("all");

  const allVratDates = getAllVratDates();

  const filteredVratDates = allVratDates
    .map(({ date, vrats }) => ({
      date,
      vrats: vrats.filter((v) => {
        if (filter === "all") return true;
        if (filter === "hindu") return v.tradition === "Hindu" || v.tradition === "Both";
        if (filter === "jain") return v.tradition === "Jain" || v.tradition === "Both";
        return true;
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
          <h1 className="font-serif text-2xl font-bold text-foreground">Vrat Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            2026 — Tap any highlighted date
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-4" role="group" aria-label="Filter by tradition">
          {FILTER_LABELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setFilter(value); setSelected(null); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === value
                  ? value === "jain"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "saffron-gradient text-white shadow-sm"
                  : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`filter-${value}`}
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="vrat-card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
              data-testid="prev-month"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
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
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
              data-testid="next-month"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            vratDates={vratDateMap}
            today={todayStr}
            onDayClick={(dateStr, vrats) => setSelected({ dateStr, vrats })}
          />
        </div>

        <div className="vrat-card p-4 mb-4">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
            Legend
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(filter === "jain" ? JAIN_LEGEND : filter === "hindu" ? HINDU_LEGEND : [...HINDU_LEGEND, ...JAIN_LEGEND]).map((item) => (
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

        <div className="vrat-card p-4 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            Dates are approximate and based on the Hindu lunar calendar for 2026.
            Always confirm with your local pandit or community calendar.
          </p>
        </div>
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
