import { useState, useEffect, useRef } from "react";
import type { Vrat } from "@/data/vrats";
import { getUserLocation, type UserLocation } from "@/hooks/useUserPrefs";

// ─── localStorage keys ────────────────────────────────────────────────────────
const FAST_START_KEY = "vrat_nirjala_fast_start";
const FAST_DATE_KEY  = "vrat_nirjala_fast_date";

// ─── Vrat-specific config ─────────────────────────────────────────────────────
type FastEndType = "moonrise" | "sunrise-next" | "sunset";

interface FastConfig {
  endType: FastEndType;
  specialMessage?: string;
  completionAddendum?: string;
  isJainUpvas?: boolean;
  isNirjalaStrict?: boolean; // no food OR water
}

const FAST_CONFIG: Record<string, FastConfig> = {
  "karva-chauth": {
    endType: "moonrise",
    specialMessage: "Fasting for your husband's long life 🌙",
    completionAddendum:
      "Look at the moon through a sieve, then see your husband's face. Karva Chauth Mubarak 🌙",
    isNirjalaStrict: true,
  },
  "hartalika-teej": {
    endType: "sunrise-next",
    isNirjalaStrict: true,
  },
  "maha-shivratri": {
    endType: "sunrise-next",
    isNirjalaStrict: true,
  },
  "ekadashi-jun-1": {
    endType: "sunrise-next",
    isNirjalaStrict: true,
  },
  "chhath-puja": {
    endType: "sunrise-next",
    isNirjalaStrict: true,
  },
  "jitiya": {
    endType: "sunrise-next",
    isNirjalaStrict: true,
  },
  "paryushana": {
    endType: "sunset",
    specialMessage: "Fasting in the spirit of ahimsa 🙏",
    isJainUpvas: true,
  },
  "samvatsari": {
    endType: "sunset",
    specialMessage: "Fasting in the spirit of ahimsa 🙏",
    isJainUpvas: true,
  },
  "kshamavani": {
    endType: "sunset",
    specialMessage: "Fasting in the spirit of ahimsa 🙏",
    isJainUpvas: true,
  },
};

// ─── End-time helpers ─────────────────────────────────────────────────────────
function getMoonriseTime(base: Date, location: UserLocation): Date {
  const t = new Date(base);
  switch (location) {
    case "uk":        t.setHours(19, 15, 0, 0); break;
    case "usa":       t.setHours(19, 30, 0, 0); break;
    case "australia": t.setHours(18, 45, 0, 0); break;
    default:          t.setHours(19, 45, 0, 0); // India
  }
  return t;
}

function getSunsetTime(base: Date, location: UserLocation): Date {
  const t = new Date(base);
  const month = base.getMonth();
  switch (location) {
    case "uk":
      t.setHours(month >= 3 && month <= 8 ? 20 : 16, month >= 3 && month <= 8 ? 0 : 30, 0, 0);
      break;
    case "usa":       t.setHours(19, 0, 0, 0); break;
    case "australia": t.setHours(18, 0, 0, 0); break;
    default:          t.setHours(18, 30, 0, 0); // India
  }
  return t;
}

function getSunriseNextMorning(base: Date): Date {
  const t = new Date(base);
  t.setDate(t.getDate() + 1);
  t.setHours(6, 0, 0, 0);
  return t;
}

function getEndTime(config: FastConfig, now: Date, location: UserLocation): Date {
  switch (config.endType) {
    case "moonrise":    return getMoonriseTime(now, location);
    case "sunset":      return getSunsetTime(now, location);
    case "sunrise-next": return getSunriseNextMorning(now);
  }
}

function formatEndLabel(config: FastConfig, endTime: Date, location: UserLocation): string {
  const timeStr = endTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const locationLabel =
    location === "uk" ? "UK" :
    location === "usa" ? "Eastern" :
    location === "australia" ? "AEST" : "IST";

  switch (config.endType) {
    case "moonrise":     return `Moonrise at ${timeStr} ${locationLabel}`;
    case "sunset":       return `Sunset at ${timeStr} ${locationLabel}`;
    case "sunrise-next": return `Sunrise tomorrow at ${timeStr}`;
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────
const notificationTimerIds = new Set<ReturnType<typeof setTimeout>>();

function clearScheduledNotifications() {
  notificationTimerIds.forEach((id) => clearTimeout(id));
  notificationTimerIds.clear();
}

async function scheduleNotifications(
  fastStartMs: number,
  isStrict: boolean
) {
  if (!("Notification" in window)) return;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  clearScheduledNotifications();

  const message = isStrict
    ? "Nirjala fast — no food or water. Stay strong. You are almost there."
    : "Stay hydrated with your permitted drinks — you are doing beautifully.";

  const now = Date.now();

  for (let h = 3; h <= 24; h += 3) {
    const triggerAt = fastStartMs + h * 3_600_000;
    const delay = triggerAt - now;
    if (delay <= 0) continue;

    const id = setTimeout(() => {
      new Notification("VRAT — Fasting Reminder", { body: message });
    }, delay);
    notificationTimerIds.add(id);
  }
}

// ─── Circular progress ring ───────────────────────────────────────────────────
const RING_R = 58;
const RING_STROKE = 9;
const RING_SIZE = (RING_R + RING_STROKE) * 2 + 4;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

function ProgressRing({ progress }: { progress: number }) {
  const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      className="drop-shadow-md"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_R}
        fill="none"
        stroke="rgba(224,123,42,0.15)"
        strokeWidth={RING_STROKE}
      />
      {/* Progress */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_R}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#E07B2A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Time formatting helpers ──────────────────────────────────────────────────
function fmtDuration(ms: number): { h: number; m: number; s: number } {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}

function durStr({ h, m }: { h: number; m: number; s: number }): string {
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m`;
}

// ─── Main component (guard wrapper) ──────────────────────────────────────────
export default function NirjalaFastTimer({ vrat }: { vrat: Vrat }) {
  const config = FAST_CONFIG[vrat.id];
  if (!config) return null;
  return <NirjalaFastTimerInner vrat={vrat} config={config} />;
}

function NirjalaFastTimerInner({ vrat, config }: { vrat: Vrat; config: FastConfig }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const location = getUserLocation();

  // ── Fast start time from localStorage ────────────────────────────────────
  const [fastStartMs, setFastStartMs] = useState<number | null>(() => {
    const storedDate = localStorage.getItem(FAST_DATE_KEY);
    const storedStart = localStorage.getItem(FAST_START_KEY);
    if (storedDate === todayStr && storedStart) {
      return parseInt(storedStart, 10);
    }
    return null;
  });

  // ── Live ticker ───────────────────────────────────────────────────────────
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const endTime   = getEndTime(config, new Date(), location);
  const endMs     = endTime.getTime();
  const remaining = Math.max(0, endMs - now);
  const elapsed   = fastStartMs ? now - fastStartMs : 0;
  const totalFast = fastStartMs ? Math.max(1, endMs - fastStartMs) : endMs - (new Date().setHours(6, 0, 0, 0));
  const progress  = fastStartMs ? Math.min(1, elapsed / totalFast) : 0;
  const done      = remaining === 0;

  const remainFmt = fmtDuration(remaining);
  const elapsedFmt = fmtDuration(elapsed);

  const endLabel = formatEndLabel(config, endTime, location);

  // ── In-app 3-hour reminder state ──────────────────────────────────────────
  const [showReminder, setShowReminder] = useState(false);
  const prevHourRef = useRef(-1);
  useEffect(() => {
    if (!fastStartMs) return undefined;
    const elapsedHours = Math.floor((now - fastStartMs) / 3_600_000);
    let cleanup: (() => void) | undefined;
    if (elapsedHours > 0 && elapsedHours % 3 === 0 && elapsedHours !== prevHourRef.current) {
      prevHourRef.current = elapsedHours;
      setShowReminder(true);
      const id = setTimeout(() => setShowReminder(false), 30_000);
      cleanup = () => clearTimeout(id);
    }
    return cleanup;
  }, [fastStartMs, now]);

  // ── "Start my fast" handler ───────────────────────────────────────────────
  function handleStart() {
    const ts = Date.now();
    localStorage.setItem(FAST_START_KEY, String(ts));
    localStorage.setItem(FAST_DATE_KEY, todayStr);
    setFastStartMs(ts);
    scheduleNotifications(ts, !!config.isNirjalaStrict);
  }

  const isStrict = !!config.isNirjalaStrict;
  const isJain   = !!config.isJainUpvas;

  // ── Reminder text ─────────────────────────────────────────────────────────
  const reminderText = isStrict
    ? "Nirjala fast — no food or water. Stay strong. You are almost there."
    : "Stay hydrated with your permitted drinks — you are doing beautifully.";

  // ── Render ────────────────────────────────────────────────────────────────
  const borderColor = isJain ? "#22C55E" : "#E07B2A";
  const accentColor = isJain ? "#15803D" : "#C86B1A";
  const gradFrom    = isJain ? "#F0FFF4" : "#FEF3E2";
  const gradTo      = isJain ? "#DCFCE7" : "#FFF9F0";

  return (
    <div
      className="rounded-3xl p-5 mb-4"
      data-testid="nirjala-fast-timer"
      style={{
        background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
        border: `2px solid ${borderColor}44`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: accentColor }}
        >
          {isJain ? "Jain Upvas Timer" : "Nirjala Fast Timer"}
        </p>
        <span className="text-xs text-muted-foreground">{endLabel}</span>
      </div>

      {/* Special message */}
      {config.specialMessage && (
        <p className="text-sm font-medium text-center mb-4" style={{ color: accentColor }}>
          {config.specialMessage}
        </p>
      )}

      {done ? (
        /* ── Completion state ────────────────────────────────────────────── */
        <div className="text-center py-3">
          <div className="text-4xl mb-3">🙏</div>
          <p className="font-serif text-lg font-bold text-foreground mb-2">
            Fast complete
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-2">
            Jai Mata Di — your devotion is beautiful. Please break your fast gently with water first.
          </p>
          {config.completionAddendum && (
            <p className="text-sm font-medium leading-relaxed mt-2" style={{ color: accentColor }}>
              {config.completionAddendum}
            </p>
          )}
        </div>
      ) : (
        /* ── Active timer ────────────────────────────────────────────────── */
        <div className="flex flex-col items-center">
          {/* Ring */}
          <div className="relative mb-3">
            <ProgressRing progress={progress} />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <p
                className="font-serif font-bold leading-none"
                style={{
                  fontSize: "clamp(1.5rem, 8vw, 2rem)",
                  color: accentColor,
                }}
                data-testid="nirjala-remaining"
              >
                {durStr(remainFmt)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">remaining</p>
            </div>
          </div>

          {/* Elapsed */}
          {fastStartMs ? (
            <p className="text-sm text-muted-foreground mb-2">
              Fasting for{" "}
              <span className="font-semibold text-foreground">
                {elapsedFmt.h}h {String(elapsedFmt.m).padStart(2, "0")}m
              </span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">
              Tap below when you begin your fast
            </p>
          )}

          {/* Encouragement */}
          <p className="text-xs text-center italic mb-4" style={{ color: accentColor }}>
            Stay strong — you are doing beautifully
          </p>

          {/* Start button (shows only before fast is started) */}
          {!fastStartMs && (
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm tracking-wide transition-all active:scale-95"
              style={{
                background: isJain
                  ? "linear-gradient(135deg, #15803D 0%, #22C55E 100%)"
                  : "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)",
              }}
              data-testid="start-fast-btn"
            >
              Start my fast
            </button>
          )}

          {/* In-app 3-hour reminder */}
          {showReminder && (
            <div
              className="w-full rounded-xl px-4 py-3 mt-3 text-sm text-center leading-relaxed"
              style={{
                background: isStrict
                  ? "rgba(220,38,38,0.08)"
                  : "rgba(224,123,42,0.10)",
                borderLeft: `3px solid ${isStrict ? "#DC2626" : "#E07B2A"}`,
              }}
            >
              {reminderText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

