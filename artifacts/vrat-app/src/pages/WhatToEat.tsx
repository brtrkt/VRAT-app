import { useState, useEffect } from "react";
import { getVratsForDate, getNextVrat } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";

const HYDRATING_LABELS = new Set(["Water", "Coconut Water", "Lassi", "Buttermilk", "Herbal Tea"]);

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
    count >= 5
      ? { label: "Well hydrated — well done", color: "bg-green-500", text: "text-green-700", bg: "bg-green-50", border: "border-green-100", icon: "💚" }
      : count >= 3
      ? { label: "Getting there — keep sipping", color: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", icon: "💛" }
      : { label: "Drink more — you need hydration", color: "bg-red-400", text: "text-red-700", bg: "bg-red-50", border: "border-red-100", icon: "🔴" };

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
              className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-0.5 rounded"
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
                    className="w-5 h-5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
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
  type: "allowed" | "avoided";
}) {
  const isAllowed = type === "allowed";
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg ${isAllowed ? "text-green-600" : "text-red-500"}`}>
          {isAllowed ? "✓" : "✗"}
        </span>
        <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-2.5 rounded-xl ${
              isAllowed
                ? "bg-green-50 border border-green-100"
                : "bg-red-50 border border-red-100"
            }`}
            data-testid={`food-${type}-${i}`}
          >
            <span
              className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                isAllowed
                  ? "bg-green-200 text-green-700"
                  : "bg-red-200 text-red-700"
              }`}
            >
              {isAllowed ? "✓" : "✗"}
            </span>
            <span className="text-sm text-foreground leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MealIdeasSection({ vrat }: { vrat: Vrat }) {
  return (
    <div className="vrat-card p-5 mb-4" data-testid="meal-ideas-section">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🍽</span>
        <h3 className="font-serif text-base font-semibold text-foreground">Meal Idea</h3>
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
  return (
    <div data-testid={`vrat-food-card-${vrat.id}`}>
      <div className="saffron-gradient rounded-2xl p-4 mb-4 text-white">
        <p className="text-xs font-medium tracking-widest uppercase text-white/70 mb-1">Fasting Today</p>
        <h2 className="font-serif text-2xl font-bold">{vrat.name}</h2>
        <p className="text-white/80 text-sm mt-1">Deity: {vrat.deity}</p>
        <p className="text-white/70 text-xs mt-2 leading-relaxed">{vrat.description}</p>
      </div>

      <div className="vrat-card p-5 mb-4">
        <FoodList
          title="Foods Allowed"
          items={vrat.foodsAllowed}
          type="allowed"
        />
        <div className="h-px bg-border my-4" />
        <FoodList
          title="Foods to Avoid"
          items={vrat.foodsAvoided}
          type="avoided"
        />
      </div>

      <MealIdeasSection vrat={vrat} />
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
  const [today] = useState(new Date());
  const todayStr = today.toISOString().split("T")[0];
  const vratsToday = getVratsForDate(todayStr);
  const nextVrat = getNextVrat(today);

  const primaryVrat = vratsToday[0];

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">What to Eat</h1>
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

        <div className="vrat-card p-4 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "Ahaar shuddhi se chitta shuddhi hoti hai" — Pure food leads to a pure mind.
            Your fast is a gift you give to your spirit.
          </p>
        </div>
      </div>
    </div>
  );
}
