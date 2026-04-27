import { useState, useEffect, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { getVratsForDate, getNextVratForTradition, filterVratsByTradition, JAIN_ALWAYS_ALLOWED, JAIN_YEAR_ROUND_AVOIDED } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";
import { getUserTradition } from "@/hooks/useUserPrefs";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PageFooter from "@/components/PageFooter";
import NirjalaWarning from "@/components/NirjalaWarning";
import VratKathaSection from "@/components/VratKathaSection";
import SankalpModal, { SankalpButton } from "@/components/SankalpModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateFood } from "@/data/translations";

const HYDRATING_LABELS = new Set(["Water", "Coconut Water", "Lassi", "Buttermilk", "Herbal Tea"]);

// ─── Energy guide lookup ──────────────────────────────────────────────────────
type EnergyLevel = "Light" | "Medium" | "Heavy";

interface FoodInfo {
  energy: EnergyLevel;
  tip: string;
}

const FOOD_GUIDE: { match: string[]; energy: EnergyLevel; tip: string }[] = [
  { match: ["makhana", "fox nut"],           energy: "Light",  tip: "Perfect light snack — won't make you feel heavy. Roast in a little ghee for flavour." },
  { match: ["sabudana", "tapioca"],          energy: "Medium", tip: "Add peanuts for protein to slow energy release and keep you fuller for longer." },
  { match: ["kuttu", "buckwheat"],           energy: "Heavy",  tip: "Filling — have once as a main meal. A small portion goes a long way." },
  { match: ["singhara", "water chestnut"],   energy: "Medium", tip: "Lighter than kuttu. Singhara roti is filling without the heaviness — good for a midday meal." },
  { match: ["rajgira", "amaranth"],          energy: "Medium", tip: "Higher in protein than most vrat grains. Rajgira ladoo makes a great mid-morning energy bite." },
  { match: ["sama rice", "samak", "barnyard millet", "samvat"], energy: "Medium", tip: "Lighter alternative to regular rice. Easy on digestion — best as a midday meal." },
  { match: ["sweet potato", "shakarkand"],   energy: "Medium", tip: "Slow-release energy that keeps you steady through the afternoon. Best boiled or roasted." },
  { match: ["potato", "aloo"],               energy: "Medium", tip: "Boiled is much lighter than fried. Boiled aloo with sendha namak is easier on the stomach." },
  { match: ["paneer"],                       energy: "Heavy",  tip: "High in protein — a small portion keeps hunger away for hours. Ideal for the afternoon." },
  { match: ["kheer", "payasam"],             energy: "Heavy",  tip: "Rich and satisfying — best as a morning or midday meal, not late at night." },
  { match: ["halwa"],                        energy: "Heavy",  tip: "Very filling and sweet. A small portion in the morning gives energy for several hours." },
  { match: ["dry fruit", "almond", "cashew", "walnut", "raisin", "kaju", "badam", "pista"], energy: "Heavy", tip: "Very energy-dense — 4 to 5 pieces is enough. Best in the morning, not just before sleep." },
  { match: ["peanut", "groundnut"],          energy: "Medium", tip: "A small handful gives lasting energy. Mix into sabudana dishes to make them more sustaining." },
  { match: ["dahi", "yogurt", "curd"],       energy: "Light",  tip: "Cooling and easy to digest. A small bowl in the afternoon helps beat energy dips." },
  { match: ["milk"],                         energy: "Medium", tip: "Warm milk at night soothes hunger and aids sleep. Add a little mishri if needed." },
  { match: ["lassi", "buttermilk", "chaas"], energy: "Light",  tip: "Hydrating and cooling. Great in the afternoon when energy typically dips during a fast." },
  { match: ["coconut water"],                energy: "Light",  tip: "Nature's electrolyte drink — best mid-morning to balance energy and hydration." },
  { match: ["coconut", "nariyal"],           energy: "Light",  tip: "Fresh coconut curbs hunger without weighing you down. A few pieces at a time is ideal." },
  { match: ["fruit", "banana", "papaya", "mango", "apple", "pomegranate", "watermelon", "pear", "guava", "chikoo", "kiwi"], energy: "Light", tip: "Eat in the morning for a natural energy boost. Banana is especially good before a long fast." },
  { match: ["ghee"],                         energy: "Medium", tip: "A teaspoon adds flavour and helps absorb fat-soluble vitamins. A little goes a long way." },
  { match: ["sendha namak", "rock salt"],    energy: "Light",  tip: "Essential for fasting — regular salt is not permitted. Use it freely in all your dishes." },
  { match: ["mishri", "rock candy", "sugar"], energy: "Light", tip: "A small piece gives a quick energy lift. Better than processed sugar on a fast day." },
  { match: ["water"],                        energy: "Light",  tip: "Sip steadily throughout the day. Don't wait until you're thirsty — especially on warm days." },
];

function getFoodInfo(item: string): FoodInfo | null {
  const lower = item.toLowerCase();
  for (const entry of FOOD_GUIDE) {
    if (entry.match.some((kw) => lower.includes(kw))) {
      return { energy: entry.energy, tip: entry.tip };
    }
  }
  return null;
}

const ENERGY_STYLES: Record<EnergyLevel, { label: string; bg: string; text: string; dot: string }> = {
  Light:  { label: "Light",  bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  Medium: { label: "Medium", bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
  Heavy:  { label: "Heavy",  bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
};

const LOG_ITEMS = [
  { label: "Water", emoji: "💧" },
  { label: "Coconut Water", emoji: "🥥" },
  { label: "Lassi", emoji: "🥛" },
  { label: "Buttermilk", emoji: "🫙" },
  { label: "Herbal Tea", emoji: "🍵" },
  { label: "Fruits", emoji: "🍎" },
  { label: "Makhana", emoji: "🌾" },
  { label: "Sabudana", emoji: "🍚" },
  { label: "Nuts", emoji: "🥜" },
];

const SIKH_LOG_ITEMS = [
  { label: "Water", emoji: "💧" },
  { label: "Langar Chai", emoji: "☕" },
  { label: "Lassi", emoji: "🥛" },
  { label: "Dal", emoji: "🫘" },
  { label: "Roti", emoji: "🫓" },
  { label: "Rice", emoji: "🍚" },
  { label: "Sabzi", emoji: "🥬" },
  { label: "Kadah Prasad", emoji: "🙏" },
  { label: "Fruits", emoji: "🍎" },
];

interface LogEntry {
  id: string;
  label: string;
  emoji: string;
  time: string;
}

const LOG_STORAGE_KEY = "vrat_food_log";
const LOG_DATE_KEY = "vrat_food_log_date";

function loadLog(todayStr: string): LogEntry[] {
  try {
    const savedDate = localStorage.getItem(LOG_DATE_KEY);
    if (savedDate !== todayStr) {
      localStorage.removeItem(LOG_STORAGE_KEY);
      localStorage.setItem(LOG_DATE_KEY, todayStr);
      return [];
    }
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLog(entries: LogEntry[]) {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

function HydrationBar({ log }: { log: LogEntry[] }) {
  const count = log.filter((e) => HYDRATING_LABELS.has(e.label)).length;
  const MAX = 5;
  const pct = Math.min((count / MAX) * 100, 100);

  const state =
    count === 0
      ? { label: "Tap a drink above to track hydration", color: "bg-stone-300", text: "text-stone-500", bg: "bg-stone-50", border: "border-stone-100", icon: "💧" }
      : count >= 5
      ? { label: "Well hydrated — well done!", color: "bg-green-500", text: "text-green-700", bg: "bg-green-50", border: "border-green-100", icon: "💚" }
      : count >= 3
      ? { label: "Almost there — keep sipping", color: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", icon: "💛" }
      : { label: "Good start — drink a bit more", color: "bg-amber-300", text: "text-amber-600", bg: "bg-amber-50/60", border: "border-amber-100", icon: "🫗" };

  return (
    <div
      className={`rounded-2xl px-4 py-3 mb-4 border ${state.bg} ${state.border} transition-all`}
      data-testid="hydration-bar"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{state.icon}</span>
          <span className={`text-xs font-medium ${state.text}`} data-testid="hydration-label">
            {state.label}
          </span>
        </div>
        <span className={`text-xs font-semibold ${state.text}`} data-testid="hydration-count">
          {count}/{MAX}
        </span>
      </div>
      <div className="h-2 rounded-full bg-black/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${state.color}`}
          style={{ width: `${pct}%` }}
          data-testid="hydration-progress"
          role="progressbar"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={MAX}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 opacity-70">
        Water · Coconut Water · Lassi · Buttermilk · Herbal Tea
      </p>
    </div>
  );
}

function FoodLog({ todayStr }: { todayStr: string }) {
  const [log, setLog] = useState<LogEntry[]>(() => loadLog(todayStr));
  const tradition = getUserTradition();
  const logItems = tradition === "Sikh" ? SIKH_LOG_ITEMS : LOG_ITEMS;

  useEffect(() => {
    saveLog(log);
  }, [log]);

  function addEntry(item: { label: string; emoji: string }) {
    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      label: item.label,
      emoji: item.emoji,
      time,
    };
    setLog((prev) => [entry, ...prev]);
  }

  function removeEntry(id: string) {
    setLog((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="vrat-card p-5 mb-4" data-testid="food-log-section">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📋</span>
        <h3 className="font-serif text-base font-semibold text-foreground">Today's Food Log</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {logItems.map((item) => (
          <button
            key={item.label}
            onClick={() => addEntry(item)}
            className="flex items-center gap-1.5 bg-accent/50 hover:bg-accent active:scale-95 border border-accent-border text-foreground text-xs font-medium px-3 py-2 rounded-full transition-all"
            data-testid={`log-btn-${item.label.toLowerCase().replace(/\s/g, "-")}`}
            aria-label={`Log ${item.label}`}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <HydrationBar log={log} />

      {log.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm italic">Nothing logged yet today.</p>
          <p className="text-xs mt-1 opacity-70">Tap a button above to track what you've had.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Logged Today — {log.length} {log.length === 1 ? "item" : "items"}
            </p>
            <button
              onClick={() => setLog([])}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg min-h-[44px] flex items-center"
              data-testid="clear-log-btn"
              aria-label="Clear all log entries"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2" data-testid="log-entries-list">
            {log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2.5 group"
                data-testid={`log-entry-${entry.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{entry.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{entry.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{entry.time}</span>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="w-8 h-8 rounded-full text-muted-foreground/50 active:text-destructive active:bg-destructive/10 flex items-center justify-center transition-all text-xs"
                    data-testid={`remove-entry-${entry.id}`}
                    aria-label={`Remove ${entry.label} entry`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OmSymbol({ className = "" }: { className?: string }) {
  return <span className={`font-serif ${className}`} aria-hidden="true">ॐ</span>;
}

function FoodList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "allowed" | "avoided" | "restricted";
}) {
  const { lang, t } = useLanguage();
  const isAllowed = type === "allowed";
  const isRestricted = type === "restricted";

  const energyLabel = (level: string) => {
    if (level === "Light") return t("food.light");
    if (level === "Medium") return t("food.medium");
    if (level === "Heavy") return t("food.heavy");
    return level;
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg ${isAllowed ? "text-green-600" : isRestricted ? "text-amber-600" : "text-red-500"}`}>
          {isAllowed ? "✓" : isRestricted ? "⚑" : "✗"}
        </span>
        <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const info = isAllowed ? getFoodInfo(item) : null;
          const style = info ? ENERGY_STYLES[info.energy] : null;
          const translatedItem = translateFood(item, lang);
          return (
            <div
              key={i}
              className={`px-4 py-3 rounded-xl ${
                isAllowed
                  ? "bg-green-50 border border-green-100"
                  : isRestricted
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-red-50 border border-red-100"
              }`}
              data-testid={`food-${type}-${i}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    isAllowed
                      ? "bg-green-200 text-green-700"
                      : isRestricted
                      ? "bg-amber-200 text-amber-800"
                      : "bg-red-200 text-red-700"
                  }`}
                >
                  {isAllowed ? "✓" : isRestricted ? "!" : "✗"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-foreground leading-relaxed">{translatedItem}</span>
                    {style && (
                      <span
                        className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5"
                        style={{ background: style.bg, color: style.text }}
                        data-testid={`energy-badge-${i}`}
                        aria-label={`Energy level: ${style.label}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: style.dot }}
                        />
                        {energyLabel(style.label)}
                      </span>
                    )}
                  </div>
                  {info && (
                    <p
                      className="text-xs mt-1.5 leading-relaxed"
                      style={{ color: "#7C6F5A" }}
                      data-testid={`food-tip-${i}`}
                    >
                      💡 {info.tip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MealIdeasSection({ vrat }: { vrat: Vrat }) {
  const { t } = useLanguage();
  const isSikh = vrat.tradition === "Sikh";
  return (
    <div className="vrat-card p-5 mb-4" data-testid="meal-ideas-section">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🍽</span>
        <h3 className="font-serif text-base font-semibold text-foreground">{t("food.mealIdea")}</h3>
      </div>
      <div className="rounded-2xl p-4" style={isSikh ? { background: "#EFF6FF" } : { background: "var(--accent, #FFF7ED)" }}>
        <p className="text-sm text-foreground leading-relaxed" data-testid="meal-idea-text">
          {vrat.mealIdea}
        </p>
      </div>
      <div className="mt-3 bg-muted/40 rounded-2xl p-4">
        {isSikh ? (
          <p className="text-xs text-muted-foreground italic text-center">
            Sikh observances focus on langar (community meals) — simple vegetarian food served freely to all as an act of seva (selfless service). No special fasting foods required.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic text-center">
            All vrat-friendly dishes use sendha namak (rock salt) and no onion or garlic.
            Your kitchen becomes your temple.
          </p>
        )}
      </div>
    </div>
  );
}

function VratFoodCard({ vrat }: { vrat: Vrat }) {
  const { t } = useLanguage();
  const [showSankalp, setShowSankalp] = useState(false);
  const isJain = vrat.tradition === "Jain";
  const isSikh = vrat.tradition === "Sikh";
  const vnsYear = isJain
    ? (vrat.dates?.[0] >= "2026-11-09" ? 2553 : 2552)
    : null;

  const headerStyle = isSikh
    ? { background: "linear-gradient(135deg, #001A6E 0%, #003DA5 60%, #0052CC 100%)" }
    : isJain
    ? { background: "linear-gradient(135deg, #15803D 0%, #22C55E 100%)" }
    : undefined;

  return (
    <div data-testid={`vrat-food-card-${vrat.id}`}>
      <div
        className={`rounded-2xl p-4 mb-4 text-white${!isSikh && !isJain ? " saffron-gradient" : ""}`}
        style={headerStyle}
      >
        <p className="text-xs font-medium tracking-widest uppercase mb-1"
          style={{ color: isSikh ? "#F4A900" : "rgba(255,255,255,0.7)" }}>
          {isSikh ? "ਸਿੱਖ ਤਿਉਹਾਰ · Sikh Observance" : t("home.fastDay")}
        </p>
        <h2 className="font-serif text-2xl font-bold">{vrat.name}</h2>
        {isSikh && vrat.punjabiName && (
          <p className="text-base font-medium mt-0.5" style={{ color: "#F4A900" }}>
            {vrat.punjabiName}
          </p>
        )}
        {isSikh && vrat.hinduEquivalent && (
          <p className="text-xs mt-1 font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
            Also observed as <span style={{ color: "#F4A900" }}>{vrat.hinduEquivalent}</span> in Hindu tradition
          </p>
        )}
        {vrat.nirjala && (
          <div className="mt-1.5 mb-1">
            <NirjalaWarning variant="light" />
          </div>
        )}
        <p className="text-white/80 text-sm mt-1">{isSikh ? "Observance" : "Deity"}: {vrat.deity}</p>
        <p className="text-white/70 text-xs mt-2 leading-relaxed">{vrat.description}</p>
        {isJain && vnsYear && (
          <p className="text-white/50 text-xs mt-2 font-medium tracking-wide">
            ◆ Veer Nirvana Samvat {vnsYear}
          </p>
        )}
        {isSikh && vrat.nanakshahiDate && (
          <p className="text-xs mt-2 font-semibold tracking-wide" style={{ color: "#F4A900" }}>
            ◆ {vrat.nanakshahiDate}
          </p>
        )}
      </div>

      {isSikh && (
        <div className="rounded-xl px-4 py-3 mb-4 text-xs leading-relaxed border"
          style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E3A8A" }}>
          <span className="font-semibold">📅 Calendar note:</span>{" "}
          Sikh observances follow the Nanakshahi Calendar. Dates may vary slightly by local Gurdwara tradition.
        </div>
      )}

      <SankalpButton
        vrat={vrat}
        onOpen={() => setShowSankalp(true)}
        isJain={isJain}
      />

      {showSankalp && (
        <SankalpModal vrat={vrat} onClose={() => setShowSankalp(false)} />
      )}

      <div className="vrat-card p-5 mb-4">
        {vrat.tradition === "Jain" ? (
          <>
            <FoodList
              title={t("food.jainAllowed")}
              items={JAIN_ALWAYS_ALLOWED}
              type="allowed"
            />
            <div className="h-px bg-border my-4" />
            <FoodList
              title={t("food.jainAvoided")}
              items={JAIN_YEAR_ROUND_AVOIDED}
              type="avoided"
            />
            {vrat.jainFastRestrictions && (
              <>
                <div className="h-px bg-border my-4" />
                <FoodList
                  title="Additional Restrictions on this Fast Day"
                  items={vrat.jainFastRestrictions}
                  type="restricted"
                />
              </>
            )}
          </>
        ) : (
          <>
            <FoodList
              title={t("food.allowed")}
              items={vrat.foodsAllowed}
              type="allowed"
            />
            <div className="h-px bg-border my-4" />
            <FoodList
              title={t("food.avoid")}
              items={vrat.foodsAvoided}
              type="avoided"
            />
          </>
        )}
      </div>

      <MealIdeasSection vrat={vrat} />

      <VratKathaSection vratId={vrat.id} vratName={vrat.name} />
    </div>
  );
}

function KhandaSvg({ className = "", style = {} }: { className?: string; style?: CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 838" className={className} style={style} aria-hidden="true">
      <path d="M 382.877 20.123 C 369.559 30.822, 345.376 45.962, 330.750 52.758 L 324 55.895 324 60.716 C 324 63.367, 325.121 70.478, 326.491 76.518 C 330.918 96.036, 331.246 95.385, 314.461 100.337 C 256.870 117.327, 191.500 172.746, 164.465 227.500 C 128.787 299.759, 133.953 392.025, 177.399 458.500 C 205.721 501.836, 258.627 543.384, 305.275 558.925 C 319.415 563.636, 319.789 564.487, 315.501 582.186 C 311.341 599.359, 309.421 597.713, 335.145 599.034 C 362.888 600.459, 359.904 596.918, 363.140 632.263 C 364.614 648.366, 366.925 648.221, 339.819 633.723 C 252.035 586.770, 204.974 549.771, 163.695 495.259 C 67.338 368.009, 85.097 234.198, 213 123.764 C 234.742 104.992, 234.667 103.873, 212.041 109.559 C 110.139 135.170, 38.463 217.919, 19.001 332.424 C -3.183 462.948, 77.786 612.592, 213.874 692.578 C 223.306 698.122, 229.221 704.156, 231.270 710.324 C 233.906 718.262, 236.150 716.989, 261 693.454 C 278.715 676.677, 287.385 669.523, 297.935 662.980 L 306.023 657.964 315.262 664.154 C 330.925 674.649, 347.391 686.178, 349.711 688.277 C 352.765 691.038, 351.984 692.143, 339.263 703.039 C 313.054 725.490, 308.858 729.378, 303.067 736.577 C 282.832 761.731, 290.623 784.971, 319.300 784.994 C 330.385 785.004, 333.416 782.872, 342.754 768.500 C 346.597 762.584, 352.819 754.927, 357.990 749.750 C 373.817 733.904, 377.458 740.437, 362.850 758.470 C 333.229 795.033, 383.820 841.515, 416.786 808.026 C 431.330 793.250, 431.601 775.970, 417.578 757.500 C 411.168 749.057, 410 746.910, 410 743.566 C 410 734.605, 425.868 749.290, 441.223 772.463 C 451.449 787.894, 469.510 790.098, 482.357 777.483 C 498.744 761.393, 491.697 745.849, 452.882 712.466 C 432.026 694.528, 428.655 691.121, 430.072 689.413 C 430.659 688.706, 441.041 681.316, 453.142 672.992 L 475.144 657.858 482.035 661.952 C 491.830 667.771, 501.058 675.358, 520.523 693.600 C 544.940 716.481, 546.929 717.777, 549.146 712.250 C 553.075 702.455, 555.873 699.765, 573.512 688.823 C 660.606 634.799, 723.719 555.962, 752.815 464.849 C 802.830 308.231, 705.681 131.137, 556.250 106.524 C 547.729 105.121, 550.304 108.484, 571.500 126.448 C 654.376 196.686, 688.599 278.271, 674.504 372 C 661.836 456.236, 588.780 548.821, 488.500 607.724 C 467.194 620.239, 420.825 645, 418.695 645 C 417.216 645, 419.673 608.756, 421.553 602.832 C 422.335 600.370, 423.498 600.193, 446.302 599.048 C 471.150 597.801, 470.002 598.724, 466.055 583.167 C 461.173 563.920, 460.979 564.315, 478.486 557.960 C 610.741 509.951, 674.863 366.463, 621.629 237.646 C 598.393 181.420, 529.902 119.704, 470.500 101.468 C 453.923 96.379, 453.151 96.050, 452.427 93.771 C 452.076 92.664, 453.259 84.451, 455.056 75.521 C 458.967 56.086, 459.278 57.164, 448.152 51.576 C 432.526 43.728, 411.049 30.140, 398.803 20.352 C 390.615 13.808, 390.737 13.809, 382.877 20.123 M 329.723 164.487 C 173.505 220.082, 164.045 413.813, 313.840 489.732 C 335.376 500.647, 334.660 501.050, 339.953 475 C 353.029 410.637, 357.976 316.778, 352.180 243 C 345.822 162.064, 344.963 159.063, 329.723 164.487 M 438.720 164.138 C 433.355 172.743, 426.995 257.397, 427.010 320 C 427.027 389.999, 430.285 424.681, 441.616 475.500 C 447.333 501.142, 445.886 499.900, 461.500 492.567 C 615.210 420.383, 612.274 229.328, 456.490 166.524 C 444.255 161.592, 440.613 161.102, 438.720 164.138" fill="currentColor" fillRule="evenodd" stroke="none" />
    </svg>
  );
}

function NoFastToday({ nextVrat, tradition }: { nextVrat: { vrat: Vrat; date: string } | null; tradition: string }) {
  const isSikh = tradition === "Sikh";
  return (
    <div data-testid="no-fast-message">
      <div className="vrat-card p-6 mb-4 text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4${isSikh ? "" : " bg-accent"}`}
          style={isSikh ? { background: "#EFF6FF" } : undefined}
        >
          {isSikh
            ? <KhandaSvg className="w-8 h-10" style={{ color: "#003DA5" }} />
            : <OmSymbol className="text-primary text-2xl" />
          }
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
          {isSikh ? "No observance today" : "No fast today"}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isSikh
            ? "Eat well, serve others, and remember Waheguru. Every day is a day for simran and seva."
            : "Enjoy your meals with mindfulness and gratitude. Nourish your body as you would nourish your soul."}
        </p>
      </div>

      {nextVrat && (
        <div className="vrat-card p-5 mb-4">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
            {isSikh ? "Upcoming Observance" : "Prepare for Next Vrat"}
          </p>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
            {nextVrat.vrat.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isSikh ? "Observance" : "Deity"}: {nextVrat.vrat.deity}
          </p>
          {!isSikh && (
            <>
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-foreground">Foods you'll need:</p>
                {nextVrat.vrat.foodsAllowed.slice(0, 5).map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    data-testid={`upcoming-food-${i}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="bg-accent/40 rounded-xl p-3">
                <p className="text-xs text-foreground font-medium mb-1">Meal idea for that day:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{nextVrat.vrat.mealIdea}</p>
              </div>
            </>
          )}
          {isSikh && (
            <div className="rounded-xl p-3" style={{ background: "#EFF6FF" }}>
              <p className="text-xs leading-relaxed" style={{ color: "#1E3A8A" }}>
                Sikh observances are days of simran (meditation), seva (selfless service), and sharing in the langar. No special food restrictions — eat simple, vegetarian food with gratitude.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WhatToEat() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [today] = useState(new Date());
  const todayStr = today.toISOString().split("T")[0];
  const userTradition = getUserTradition();
  const vratsToday = filterVratsByTradition(getVratsForDate(todayStr), userTradition);
  const nextVrat = getNextVratForTradition(today, userTradition);

  const primaryVrat = vratsToday[0];

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">{t("nav.eat")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {vratsToday.length > 0
              ? "Your fasting guide for today"
              : "Plan your meals with devotion"}
          </p>
        </div>

        {primaryVrat ? (
          <VratFoodCard vrat={primaryVrat} />
        ) : (
          <NoFastToday nextVrat={nextVrat} tradition={userTradition} />
        )}

        <FoodLog todayStr={todayStr} />

        {/* Recipes link */}
        <button
          onClick={() => setLocation(userTradition === "Sikh" ? "/langar-recipes" : "/recipes")}
          className="vrat-card p-5 mb-4 flex items-center justify-between gap-3 w-full text-left active:opacity-80 transition-opacity"
          data-testid="recipes-link"
          style={userTradition === "Sikh" ? { borderColor: "#BFDBFE" } : undefined}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{userTradition === "Sikh" ? "🫘" : "🍳"}</span>
            <div>
              <p className="font-serif text-base font-semibold text-foreground">
                {userTradition === "Sikh" ? "Langar Recipes" : "Fasting Recipes"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {userTradition === "Sikh"
                  ? "4 traditional langar dishes — with full method"
                  : "10 traditional recipes — step by step"}
              </p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="vrat-card p-4 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            {userTradition === "Sikh"
              ? "\"Ik Onkar — Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh.\" Food prepared with love and shared freely is the highest seva."
              : "\"Ahaar shuddhi se chitta shuddhi hoti hai\" — Pure food leads to a pure mind. Your fast is a gift you give to your spirit."}
          </p>
        </div>

        <DisclaimerBanner />
        <PageFooter />
      </div>
    </div>
  );
}
