import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getVratsForDate, getNextVrat, JAIN_ALWAYS_ALLOWED, JAIN_YEAR_ROUND_AVOIDED } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";
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
        {LOG_ITEMS.map((item) => (
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
  return (
    <div className="vrat-card p-5 mb-4" data-testid="meal-ideas-section">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🍽</span>
        <h3 className="font-serif text-base font-semibold text-foreground">{t("food.mealIdea")}</h3>
      </div>
      <div className="bg-accent/40 rounded-2xl p-4">
        <p className="text-sm text-foreground leading-relaxed" data-testid="meal-idea-text">
          {vrat.mealIdea}
        </p>
      </div>
      <div className="mt-3 bg-muted/40 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground italic text-center">
          All vrat-friendly dishes use sendha namak (rock salt) and no onion or garlic.
          Your kitchen becomes your temple.
        </p>
      </div>
    </div>
  );
}

function VratFoodCard({ vrat }: { vrat: Vrat }) {
  const { t } = useLanguage();
  const [showSankalp, setShowSankalp] = useState(false);
  const isJain = vrat.tradition === "Jain";

  return (
    <div data-testid={`vrat-food-card-${vrat.id}`}>
      <div
        className={`rounded-2xl p-4 mb-4 text-white${isJain ? "" : " saffron-gradient"}`}
        style={isJain ? { background: "linear-gradient(135deg, #15803D 0%, #22C55E 100%)" } : undefined}
      >
        <p className="text-xs font-medium tracking-widest uppercase text-white/70 mb-1">{t("home.fastDay")}</p>
        <h2 className="font-serif text-2xl font-bold">{vrat.name}</h2>
        {vrat.nirjala && (
          <div className="mt-1.5 mb-1">
            <NirjalaWarning variant="light" />
          </div>
        )}
        <p className="text-white/80 text-sm mt-1">Deity: {vrat.deity}</p>
        <p className="text-white/70 text-xs mt-2 leading-relaxed">{vrat.description}</p>
      </div>

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

function NoFastToday({ nextVrat }: { nextVrat: { vrat: Vrat; date: string } | null }) {
  return (
    <div data-testid="no-fast-message">
      <div className="vrat-card p-6 mb-4 text-center">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <OmSymbol className="text-primary text-2xl" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
          No fast today
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Enjoy your meals with mindfulness and gratitude. Nourish your body as you would nourish your soul.
        </p>
      </div>

      {nextVrat && (
        <div className="vrat-card p-5 mb-4">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
            Prepare for Next Vrat
          </p>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
            {nextVrat.vrat.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deity: {nextVrat.vrat.deity}
          </p>
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
  const vratsToday = getVratsForDate(todayStr);
  const nextVrat = getNextVrat(today);

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
          <NoFastToday nextVrat={nextVrat} />
        )}

        <FoodLog todayStr={todayStr} />

        {/* Recipes link */}
        <button
          onClick={() => setLocation("/recipes")}
          className="vrat-card p-5 mb-4 flex items-center justify-between gap-3 w-full text-left active:opacity-80 transition-opacity"
          data-testid="recipes-link"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🍳</span>
            <div>
              <p className="font-serif text-base font-semibold text-foreground">Fasting Recipes</p>
              <p className="text-xs text-muted-foreground mt-0.5">10 traditional recipes — step by step</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="vrat-card p-4 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "Ahaar shuddhi se chitta shuddhi hoti hai" — Pure food leads to a pure mind.
            Your fast is a gift you give to your spirit.
          </p>
        </div>

        <DisclaimerBanner />
        <PageFooter />
      </div>
    </div>
  );
}
