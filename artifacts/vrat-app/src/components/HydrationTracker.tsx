import { useState, useEffect, useCallback } from "react";
import type { Vrat } from "@/data/vrats";

// ─── Drink catalogue ─────────────────────────────────────────────────────────
const DRINKS = [
  { label: "Water",                     emoji: "💧", ml: 250 },
  { label: "Coconut Water",             emoji: "🥥", ml: 200 },
  { label: "Lassi / Buttermilk",        emoji: "🥛", ml: 200 },
  { label: "Milk",                       emoji: "🫗", ml: 200 },
  { label: "Lemon water (sendha namak)", emoji: "🍋", ml: 250 },
  { label: "Herbal tulsi tea",          emoji: "🍵", ml: 200 },
  { label: "Fresh fruit juice",         emoji: "🧃", ml: 150 },
  { label: "Sabudana water",            emoji: "🫙", ml: 150 },
];

const GOAL_ML = 2000;
const GLASS_ML = 250;
const TOTAL_GLASSES = 8;

const STORAGE_KEY = "vrat_hydration_log_v2";
const DATE_KEY    = "vrat_hydration_date_v2";

interface DrinkEntry {
  id: string;
  label: string;
  emoji: string;
  ml: number;
  time: string;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadLog(todayStr: string): DrinkEntry[] {
  try {
    if (localStorage.getItem(DATE_KEY) !== todayStr) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(DATE_KEY, todayStr);
      return [];
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DrinkEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLog(entries: DrinkEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

// ─── Glass icon ───────────────────────────────────────────────────────────────
function GlassIcon({ filled, partial }: { filled: boolean; partial?: number }) {
  const fill = filled ? "#E07B2A" : partial && partial > 0
    ? `rgba(224,123,42,${Math.max(0.15, partial)})`
    : "transparent";
  const border = filled || (partial && partial > 0) ? "#E07B2A" : "#D1C4B0";

  return (
    <svg viewBox="0 0 24 32" className="w-6 h-8" aria-hidden="true">
      {/* Glass outline */}
      <path
        d="M4 2 L3 28 Q3 30 6 30 L18 30 Q21 30 21 28 L20 2 Z"
        fill={fill}
        stroke={border}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Rim highlight */}
      <line x1="5" y1="2" x2="19" y2="2" stroke={border} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Glasses row ──────────────────────────────────────────────────────────────
function GlassesRow({ totalMl }: { totalMl: number }) {
  return (
    <div className="flex items-end justify-center gap-1.5 my-3" data-testid="glasses-row">
      {Array.from({ length: TOTAL_GLASSES }).map((_, i) => {
        const glassThreshold = (i + 1) * GLASS_ML;
        const prevThreshold = i * GLASS_ML;
        const filled = totalMl >= glassThreshold;
        const partial = filled ? 0 : totalMl > prevThreshold
          ? (totalMl - prevThreshold) / GLASS_ML
          : 0;
        return (
          <GlassIcon key={i} filled={filled} partial={partial} />
        );
      })}
    </div>
  );
}

// ─── Drink picker modal ───────────────────────────────────────────────────────
function DrinkModal({ onSelect, onClose }: { onSelect: (d: typeof DRINKS[0]) => void; onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl"
        style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        data-testid="drink-modal"
      >
        <div className="max-w-md mx-auto px-5 pt-5 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-foreground">Log a drink</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground active:opacity-70"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {DRINKS.map((drink) => (
              <button
                key={drink.label}
                onClick={() => { onSelect(drink); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-98"
                style={{ background: "white", border: "1.5px solid #F0E8D8" }}
                data-testid={`drink-option-${drink.label.toLowerCase().replace(/\s|\/|\(|\)/g, "-")}`}
              >
                <span className="text-xl flex-shrink-0">{drink.emoji}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{drink.label}</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "#FEF3E2", color: "#C86B1A" }}
                >
                  {drink.ml} ml
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  vratsToday: Vrat[];
  todayStr: string;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HydrationTracker({ vratsToday, todayStr }: Props) {
  const [log, setLog] = useState<DrinkEntry[]>(() => loadLog(todayStr));
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    saveLog(log);
  }, [log]);

  const addDrink = useCallback((drink: typeof DRINKS[0]) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setLog((prev) => [
      { id: `${Date.now()}-${Math.random()}`, label: drink.label, emoji: drink.emoji, ml: drink.ml, time },
      ...prev,
    ]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setLog((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const isFastDay  = vratsToday.length > 0;
  const isNirjala  = vratsToday.some((v) => v.nirjala);

  const totalMl     = log.reduce((sum, e) => sum + e.ml, 0);
  const remaining   = Math.max(0, GOAL_ML - totalMl);
  const pct         = Math.min((totalMl / GOAL_ML) * 100, 100);
  const glassesHad  = Math.floor(totalMl / GLASS_ML);

  return (
    <div className="vrat-card p-5 mb-4" data-testid="hydration-tracker">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💧</span>
        <h3 className="font-serif text-base font-semibold text-foreground">Today's Hydration</h3>
        {totalMl >= GOAL_ML && (
          <span
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#ECFDF5", color: "#16A34A", border: "1px solid #BBF7D0" }}
          >
            Goal reached! 🎉
          </span>
        )}
      </div>

      {/* Vrat day banner */}
      {isNirjala ? (
        <div
          className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2"
          style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}
          data-testid="nirjala-hydration-banner"
        >
          <span className="text-base flex-shrink-0 mt-0.5">🌙</span>
          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            Nirjala fast today — no water or food. Stay strong. Break your fast only after moonrise.
          </p>
        </div>
      ) : isFastDay ? (
        <div
          className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2"
          style={{ background: "#FEF9E7", border: "1px solid #FDE68A" }}
          data-testid="vrat-hydration-banner"
        >
          <span className="text-base flex-shrink-0 mt-0.5">🪔</span>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Fasting today — hydration is especially important. Aim for 8–10 glasses.
          </p>
        </div>
      ) : null}

      {/* Only show tracker UI when not nirjala */}
      {!isNirjala && (
        <>
          {/* 8-glass row */}
          <GlassesRow totalMl={totalMl} />

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #E07B2A, #F59E0B)" }}
              role="progressbar"
              aria-valuenow={totalMl}
              aria-valuemin={0}
              aria-valuemax={GOAL_ML}
              data-testid="hydration-progress-bar"
            />
          </div>

          {/* Stats */}
          <div className="text-center mb-4">
            <p className="text-sm font-semibold text-foreground">
              {glassesHad}/{TOTAL_GLASSES} glasses · {totalMl} ml
            </p>
            {remaining > 0 ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                You have had <span className="font-medium text-foreground">{totalMl} ml</span> today — <span className="font-medium text-foreground">{remaining} ml</span> to go to reach your 2000 ml goal.
              </p>
            ) : (
              <p className="text-xs text-green-700 font-medium mt-0.5">
                Daily goal reached — great work staying hydrated!
              </p>
            )}
          </div>

          {/* Log button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white tracking-wide transition-opacity active:opacity-80 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            data-testid="log-drink-btn"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
            </svg>
            Log a drink
          </button>

          {/* Today's log */}
          {log.length > 0 && (
            <div className="mt-4" data-testid="hydration-log-list">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  Today's log
                </p>
                <button
                  onClick={() => setLog([])}
                  className="text-xs text-muted-foreground active:opacity-60 transition-opacity"
                  data-testid="clear-hydration-btn"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-1.5">
                {log.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/40 group"
                    data-testid={`hydration-entry-${entry.id}`}
                  >
                    <span className="text-base flex-shrink-0">{entry.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight">{entry.label}</p>
                      <p className="text-xs text-muted-foreground">{entry.ml} ml · {entry.time}</p>
                    </div>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 active:opacity-60 transition-opacity"
                      aria-label={`Remove ${entry.label}`}
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M6.5 1h3a.5.5 0 010 1h-3a.5.5 0 010-1zM3 3a1 1 0 011-1h8a1 1 0 011 1v1H3V3zm1.5 2l.5 9h6l.5-9h-7z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Drink picker modal */}
      {showModal && (
        <DrinkModal onSelect={addDrink} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
