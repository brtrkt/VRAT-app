import { useState, useEffect } from "react";
import { getVratsForDate, getNextVrat, getDaysUntil, formatDateStr } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";
import DisclaimerBanner from "@/components/DisclaimerBanner";

function getParanaTime(vrat: Vrat, now: Date): Date {
  const name = vrat.name.toLowerCase();
  const parana = new Date(now);

  if (name.includes("ekadashi") || name.includes("maha shivratri")) {
    // Fast breaks at next sunrise — use 6:00 AM tomorrow
    parana.setDate(parana.getDate() + 1);
    parana.setHours(6, 0, 0, 0);
  } else if (name.includes("janmashtami")) {
    // Fast breaks at midnight (start of the next day)
    parana.setDate(parana.getDate() + 1);
    parana.setHours(0, 1, 0, 0);
  } else if (name.includes("sankashti")) {
    // Breaks after moonrise — 9 PM
    parana.setHours(21, 0, 0, 0);
  } else {
    // Navratri, Pradosh, Purnima, Karva Chauth, Guru Purnima, others — 8 PM
    parana.setHours(20, 0, 0, 0);
  }

  return parana;
}

function useCountdown(targetTime: Date | null) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!targetTime) {
      setRemaining(null);
      return;
    }
    function tick() {
      const diff = targetTime!.getTime() - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [targetTime]);

  if (remaining === null) return null;
  const totalMins = Math.floor(remaining / 60_000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return { hours, mins, done: remaining === 0 };
}

function BrahmaMuhurta() {
  // 96 minutes before default sunrise of 6:30 AM = 4:54 AM
  const SUNRISE_MINS = 6 * 60 + 30; // 390
  const brahmaMins = SUNRISE_MINS - 96; // 294
  const bHour = Math.floor(brahmaMins / 60); // 4
  const bMin = brahmaMins % 60; // 54
  const bTimeStr = `${bHour}:${String(bMin).padStart(2, "0")}am`;

  // Android SET_ALARM intent — opens Clock app with the time pre-filled
  const alarmUrl =
    `intent:#Intent;action=android.intent.action.SET_ALARM;` +
    `S.android.intent.extra.alarm.MESSAGE=Brahma%20Muhurta;` +
    `i.android.intent.extra.alarm.HOUR=${bHour};` +
    `i.android.intent.extra.alarm.MINUTES=${bMin};` +
    `Z.android.intent.extra.alarm.SKIP_UI=false;end`;

  return (
    <div
      className="rounded-3xl p-5 mb-4 border border-amber-200"
      style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" }}
      data-testid="brahma-muhurta-card"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" aria-hidden="true">🌅</span>
        <p className="text-xs font-medium tracking-widest uppercase text-amber-700">
          Brahma Muhurta
        </p>
      </div>
      <p className="text-foreground text-sm leading-relaxed mb-2">
        <span className="font-serif font-semibold text-base text-amber-900">
          Tomorrow: {bTimeStr}
        </span>
        {" — "}the most auspicious time for prayer and meditation.{" "}
        <a
          href={alarmUrl}
          className="text-amber-700 underline underline-offset-2 font-semibold hover:text-amber-900 transition-colors"
          data-testid="alarm-link"
          aria-label={`Open clock app to set alarm for Brahma Muhurta at ${bTimeStr}`}
        >
          Tap to set your alarm
        </a>
      </p>
      <p className="text-xs text-amber-600/60 mt-1">
        96 minutes before sunrise (6:30 am default)
      </p>
    </div>
  );
}

function FastingTimer({ vratsToday }: { vratsToday: Vrat[] }) {
  const now = new Date();
  const vrat = vratsToday[0] ?? null;
  const paranaTime = vrat ? getParanaTime(vrat, now) : null;
  const countdown = useCountdown(paranaTime);

  return (
    <div
      className="vrat-card p-5 mb-4 text-center"
      data-testid="fasting-timer"
    >
      {!vrat ? (
        <>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
            Fasting Countdown
          </p>
          <p className="font-serif text-xl text-muted-foreground" data-testid="timer-no-fast">
            No fast today
          </p>
        </>
      ) : countdown?.done ? (
        <>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
            Fasting Countdown
          </p>
          <p className="font-serif text-xl text-primary" data-testid="timer-done">
            Your fast is complete — well done
          </p>
        </>
      ) : (
        <>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
            Fasting Countdown
          </p>
          <p
            className="font-serif font-bold text-primary leading-none"
            style={{ fontSize: "clamp(2rem, 10vw, 2.75rem)" }}
            data-testid="timer-display"
          >
            {countdown?.hours}h {String(countdown?.mins).padStart(2, "0")}m
          </p>
          <p className="text-sm text-muted-foreground mt-2" data-testid="timer-label">
            remaining in your fast
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1" data-testid="timer-parana">
            Parana at{" "}
            {paranaTime?.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            {paranaTime &&
              paranaTime.getDate() !== now.getDate() &&
              " (tomorrow)"}
          </p>
        </>
      )}
    </div>
  );
}

function OmSymbol({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif ${className}`} aria-hidden="true">ॐ</span>
  );
}

function JainSymbol({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 72"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Five fingers: pinky → thumb */}
      <rect x="1"  y="22" width="9"  height="22" rx="4.5" />
      <rect x="12" y="14" width="9"  height="28" rx="4.5" />
      <rect x="23" y="8"  width="10" height="33" rx="5" />
      <rect x="35" y="13" width="9"  height="28" rx="4.5" />
      <rect x="46" y="21" width="9"  height="22" rx="4.5" />
      {/* Palm */}
      <path d="M1 40 C1 38 3 37 5 37 L51 37 C53 37 55 38 55 40 L55 60 C55 67 48 72 28 72 C8 72 1 67 1 60 Z" />
      {/* Ahimsa chakra wheel */}
      <circle cx="28" cy="57" r="11" fill="white" />
      <line x1="28" y1="46" x2="28" y2="68" stroke="currentColor" strokeWidth="1.5" />
      <line x1="17" y1="57" x2="39" y2="57" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20.2" y1="49.2" x2="35.8" y2="64.8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="35.8" y1="49.2" x2="20.2" y2="64.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="28" cy="57" r="2.5" />
    </svg>
  );
}

function FloralDivider() {
  return (
    <div className="decorative-divider my-4">
      <span className="text-primary text-sm opacity-60">✦</span>
    </div>
  );
}

function TodayCard({ todayStr, vratsToday }: { todayStr: string; vratsToday: Vrat[] }) {
  const today = new Date(todayStr + "T00:00:00");
  const weekday = today.toLocaleDateString("en-IN", { weekday: "long" });
  const dateFormatted = today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const isFastDay = vratsToday.length > 0;

  return (
    <div
      data-testid="today-card"
      className={`relative overflow-hidden rounded-3xl p-6 mb-4 shadow-lg ${
        isFastDay
          ? "saffron-gradient text-white"
          : "bg-card border border-card-border"
      }`}
    >
      {isFastDay && (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <OmSymbol className="text-8xl text-white" />
        </div>
      )}
      <div className="relative z-10">
        <p
          className={`text-sm font-medium tracking-widest uppercase mb-1 ${
            isFastDay ? "text-white/80" : "text-muted-foreground"
          }`}
          data-testid="today-weekday"
        >
          {weekday}
        </p>
        <h2
          className={`font-serif text-2xl font-semibold mb-3 ${
            isFastDay ? "text-white" : "text-foreground"
          }`}
          data-testid="today-date"
        >
          {dateFormatted}
        </h2>

        {isFastDay ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                Fast Day
              </span>
            </div>
            {vratsToday.map((v) => (
              <div key={v.id}>
                <h3 className="font-serif text-xl font-bold text-white" data-testid={`vrat-name-${v.id}`}>
                  {v.name}
                </h3>
                <p className="text-white/75 text-sm mt-1">{v.deity}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full font-medium">
                Free Day
              </span>
            </div>
            <p className="text-foreground font-medium">No fast today</p>
            <p className="text-muted-foreground text-sm mt-1">Enjoy your meals with joy and gratitude</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NextVratCard({ nextVrat }: { nextVrat: { vrat: Vrat; date: string } | null }) {
  if (!nextVrat) return null;

  const daysLeft = getDaysUntil(nextVrat.date, new Date());
  const dateFormatted = formatDateStr(nextVrat.date);

  return (
    <div data-testid="next-vrat-card" className="vrat-card p-5 mb-4">
      <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
        Next Vrat
      </p>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-serif text-lg font-semibold text-foreground" data-testid="next-vrat-name">
            {nextVrat.vrat.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{dateFormatted}</p>
          <p className="text-sm text-muted-foreground">{nextVrat.vrat.deity}</p>
        </div>
        <div className="text-center flex-shrink-0">
          <div
            className="w-14 h-14 rounded-2xl saffron-gradient flex flex-col items-center justify-center"
            data-testid="countdown-days"
          >
            <span className="text-white font-bold text-xl leading-none">{daysLeft}</span>
            <span className="text-white/80 text-xs">days</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MantraCard({ vrats }: { vrats: Vrat[] }) {
  const [today, setToday] = useState(new Date());
  useEffect(() => { setToday(new Date()); }, []);

  const todayStr = today.toISOString().split("T")[0];
  const currentVrats = getVratsForDate(todayStr);
  const nextVratData = getNextVrat(today);
  const displayVrat = currentVrats[0] || nextVratData?.vrat;

  if (!displayVrat) return null;

  return (
    <div data-testid="mantra-card" className="vrat-card p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        {displayVrat.tradition === "Jain"
          ? <JainSymbol className="text-green-600 w-5 h-6 flex-shrink-0" />
          : <OmSymbol className="text-primary text-lg" />
        }
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          {currentVrats.length > 0 ? "Today's Mantra" : "Upcoming Mantra"}
        </p>
      </div>
      <p
        className="font-serif text-2xl text-primary text-center py-3 leading-relaxed"
        data-testid="mantra-sanskrit"
        lang="hi"
        dir="ltr"
      >
        {displayVrat.mantra}
      </p>
      <FloralDivider />
      <p className="text-sm text-muted-foreground text-center italic leading-relaxed" data-testid="mantra-translation">
        {displayVrat.mantraTranslation}
      </p>
      <p className="text-xs text-muted-foreground text-center mt-2 opacity-70">
        — for {displayVrat.name}
      </p>
    </div>
  );
}

export default function Home() {
  const [today] = useState(new Date());
  const todayStr = today.toISOString().split("T")[0];
  const vratsToday = getVratsForDate(todayStr);
  const nextVrat = getNextVrat(today);

  const allVrats = vratsToday.length > 0 ? vratsToday : [];

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="text-center mb-6">
          <div className="flex items-end justify-center gap-4 mb-2">
            <OmSymbol className="text-primary text-3xl" />
            <JainSymbol className="text-green-600 w-7 h-9" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">VRAT</h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wide">Your Fast, Your Way</p>
        </div>

        <TodayCard todayStr={todayStr} vratsToday={vratsToday} />
        <FastingTimer vratsToday={vratsToday} />
        <NextVratCard nextVrat={nextVrat} />
        <MantraCard vrats={allVrats} />
        <BrahmaMuhurta />

        <DisclaimerBanner />

        <div className="vrat-card p-5 mb-4">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
            Traditions Covered
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Ekadashi", count: "24 days", color: "#D4A017" },
              { label: "Pradosh", count: "24 days", color: "#7C3AED" },
              { label: "Purnima", count: "12 days", color: "#C084FC" },
              { label: "Navratri", count: "18 days", color: "#DC2626" },
              { label: "Sankashti", count: "12 days", color: "#EA580C" },
              { label: "Amavasya", count: "12 days", color: "#1E3A5F" },
              { label: "Special", count: "3 days", color: "#BE185D" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2"
                data-testid={`tradition-${item.label.toLowerCase()}`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-xs font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
