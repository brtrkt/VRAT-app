import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getVratsForDate, getNextVratForTradition, getNextVratsForTradition, sortVratsPrimaryFirst, filterVratsByTradition, getDaysUntil, formatDateStr, getAllVrats, getIskconRegionBucket } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PageFooter from "@/components/PageFooter";
import NirjalaWarning from "@/components/NirjalaWarning";
import NavratriCard from "@/components/NavratriCard";
import HydrationTracker from "@/components/HydrationTracker";
import { getDaysRemaining, getUserTradition, getUserLocation, getUserRegion, TRADITION_KEY, type Tradition } from "@/hooks/useUserPrefs";
import {
  getTopStreaks,
  checkBadges,
  markBadgesSeen,
  type StreakItem,
  type BadgeResult,
} from "@/hooks/useVratHistory";
import NirjalaFastTimer from "@/components/NirjalaFastTimer";
import LanguageSelector from "@/components/LanguageSelector";
import PanchangCard from "@/components/PanchangCard";
import NanakshahiCard from "@/components/NanakshahiCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { TraditionIcon, TraditionSwitcher as SharedTraditionSwitcher, KhandaSvg, JainSymbol, OmSymbol } from "@/components/TraditionSelector";

const NIRJALA_TIMER_IDS = new Set([
  "karva-chauth", "hartalika-teej", "maha-shivratri", "ekadashi-jun-1",
  "chhath-puja", "jitiya", "paryushana", "samvatsari", "kshamavani",
]);
function isNirjalaTimerVrat(v: { id: string }) { return NIRJALA_TIMER_IDS.has(v.id); }

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

const BRAHMA_ALARM_KEY = "vrat_brahma_alarm_v1";
const BRAHMA_HOUR = 3;
const BRAHMA_MIN = 30;

function BrahmaMuhurta() {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BRAHMA_ALARM_KEY) === "1";
    } catch {
      return false;
    }
  });

  const isAndroid =
    typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

  function buildIcs(): string {
    const today = new Date();
    const start = new Date(today);
    start.setHours(BRAHMA_HOUR, BRAHMA_MIN, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 48);
    const fmt = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
        d.getDate()
      ).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(
        d.getMinutes()
      ).padStart(2, "0")}00`;
    const fmtUtc = (d: Date) =>
      `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
        d.getUTCDate()
      ).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(
        d.getUTCMinutes()
      ).padStart(2, "0")}00Z`;
    const uid = `brahma-muhurta-${fmt(start)}-${Math.random()
      .toString(36)
      .slice(2, 8)}@vrat-app.com`;
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VRAT App//Brahma Muhurta//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${fmtUtc(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      "RRULE:FREQ=DAILY",
      "SUMMARY:Brahma Muhurta",
      "DESCRIPTION:The most auspicious time for prayer and meditation.",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Brahma Muhurta",
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  }

  function downloadIcs() {
    try {
      const ics = buildIcs();
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "brahma-muhurta.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      // ignore
    }
  }

  function openAndroidAlarm() {
    const intentUrl =
      `intent:#Intent;action=android.intent.action.SET_ALARM;` +
      `S.android.intent.extra.alarm.MESSAGE=Brahma%20Muhurta;` +
      `i.android.intent.extra.alarm.HOUR=${BRAHMA_HOUR};` +
      `i.android.intent.extra.alarm.MINUTES=${BRAHMA_MIN};` +
      `B.android.intent.extra.alarm.SKIP_UI=false;` +
      `S.browser_fallback_url=${encodeURIComponent("https://vrat-app.com")};end`;
    try {
      window.location.href = intentUrl;
    } catch {
      // ignore
    }
  }

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(BRAHMA_ALARM_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
    if (next) {
      if (isAndroid) openAndroidAlarm();
      else downloadIcs();
    }
  }

  return (
    <div
      className="rounded-3xl p-5 mb-4 border border-amber-200"
      style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" }}
      data-testid="brahma-muhurta-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg" aria-hidden="true">🌅</span>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-widest uppercase text-amber-700">
              {t("home.brahmaTitle")}
            </p>
            <p
              className="font-serif font-semibold text-base text-amber-900"
              data-testid="brahma-window"
            >
              3:30 AM daily
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Brahma Muhurta daily reminder"
          onClick={handleToggle}
          data-testid="brahma-toggle"
          className="relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          style={{ backgroundColor: enabled ? "#B45309" : "#D6D3D1" }}
        >
          <span
            className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
            style={{ transform: enabled ? "translateX(24px)" : "translateX(4px)" }}
          />
        </button>
      </div>
    </div>
  );
}

function FastingTimer({ vratsToday }: { vratsToday: Vrat[] }) {
  const { t } = useLanguage();
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
            {t("home.fastCountdown")}
          </p>
          <p className="font-serif text-xl text-muted-foreground" data-testid="timer-no-fast">
            {t("home.noFastTimer")}
          </p>
        </>
      ) : countdown?.done ? (
        <>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
            {t("home.fastCountdown")}
          </p>
          <p className="font-serif text-xl text-primary" data-testid="timer-done">
            {t("home.fastDone")}
          </p>
        </>
      ) : (
        <>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
            {t("home.fastCountdown")}
          </p>
          <p
            className="font-serif font-bold text-primary leading-none"
            style={{ fontSize: "clamp(2rem, 10vw, 2.75rem)" }}
            data-testid="timer-display"
          >
            {countdown?.hours}h {String(countdown?.mins).padStart(2, "0")}m
          </p>
          <p className="text-sm text-muted-foreground mt-2" data-testid="timer-label">
            {t("home.remaining")}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1" data-testid="timer-parana">
            {t("home.parana")}{" "}
            {paranaTime?.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            {paranaTime &&
              paranaTime.getDate() !== now.getDate() &&
              ` ${t("home.tomorrow")}`}
          </p>
        </>
      )}
    </div>
  );
}

function FloralDivider() {
  return (
    <div className="decorative-divider my-4">
      <span className="text-primary text-sm opacity-60">✦</span>
    </div>
  );
}

function TrialBanner() {
  const days = getDaysRemaining();
  if (days === 0) return null;

  const isLow = days <= 5;

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 mb-4"
      style={{
        background: isLow ? "rgba(220,104,0,0.10)" : "rgba(212,160,23,0.07)",
        border: isLow ? "1px solid rgba(220,104,0,0.25)" : "1px solid rgba(212,160,23,0.18)",
      }}
      data-testid="trial-banner"
    >
      <span className="text-sm" aria-hidden="true">✨</span>
      <p className="text-xs" style={{ color: isLow ? "#C86B1A" : "#7C6235" }}>
        <span className={isLow ? "font-bold" : "font-semibold"} style={{ color: isLow ? "#C86B1A" : "#92400E" }}>
          {days} free {days === 1 ? "day" : "days"} remaining ✨
        </span>
        {isLow && (
          <span className="font-normal"> — upgrade to keep your journey going</span>
        )}
      </p>
    </div>
  );
}

function shareVratOnWhatsApp(vrats: Vrat[]) {
  const names = vrats.map((v) => v.name).join(" & ");
  const text = `🙏 Observing ${names} today — fasting for blessings.\n\n🪔 Join me or wish me strength!\n\n#VRAT #FastDay`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function TodayCard({ todayStr, vratsToday }: { todayStr: string; vratsToday: Vrat[] }) {
  const { t } = useLanguage();
  const today = new Date(todayStr + "T00:00:00");
  const weekday = today.toLocaleDateString("en-IN", { weekday: "long" });
  const dateFormatted = today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const isFastDay = vratsToday.length > 0;
  const userTrad = getUserTradition();
  const isLingayat = userTrad === "Lingayat";
  const isJain = userTrad === "Jain";

  return (
    <div
      data-testid="today-card"
      className={`relative overflow-hidden rounded-3xl p-6 mb-4 shadow-lg ${
        isFastDay
          ? isLingayat ? "text-white" : "saffron-gradient text-white"
          : "bg-card border border-card-border"
      }`}
      style={isFastDay && isLingayat ? { background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)" } : undefined}
    >
      {isFastDay && (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          {isJain
            ? <JainSymbol className="w-24 h-24 text-white" />
            : <OmSymbol className="text-8xl text-white" />}
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
                {t("home.fastDay")}
              </span>
            </div>
            {vratsToday.map((v) => (
              <div key={v.id}>
                <h3 className="font-serif text-xl font-bold text-white" data-testid={`vrat-name-${v.id}`}>
                  {v.name}
                </h3>
                {v.nirjala && (
                  <div className="mt-1.5 mb-1">
                    <NirjalaWarning variant="light" />
                  </div>
                )}
                <p className="text-white/75 text-sm mt-1">{v.deity}</p>
              </div>
            ))}
            <button
              onClick={() => shareVratOnWhatsApp(vratsToday)}
              className="mt-3 flex items-center gap-1.5 text-white/80 text-xs font-medium hover:text-white transition-colors active:scale-95"
              data-testid="whatsapp-share-btn"
              aria-label="Share on WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t("home.share")}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full font-medium">
                {t("home.today")}
              </span>
            </div>
            <p className="text-foreground font-medium">{t("home.noFastToday")}</p>
            <p className="text-muted-foreground text-sm mt-1">Enjoy your meals with joy and gratitude</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NextVratCard({ nextVrats }: { nextVrats: { vrats: Vrat[]; date: string } | null }) {
  const { t } = useLanguage();
  if (!nextVrats || nextVrats.vrats.length === 0) return null;

  const [primary, ...secondary] = nextVrats.vrats;
  const daysLeft = getDaysUntil(nextVrats.date, new Date());
  const dateFormatted = formatDateStr(nextVrats.date);
  const isLingayat = getUserTradition() === "Lingayat";

  return (
    <div data-testid="next-vrat-card" className="vrat-card p-5 mb-4">
      <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
        {t("home.nextFast")}
      </p>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-serif text-lg font-semibold text-foreground" data-testid="next-vrat-name">
            {primary.name}
          </h3>
          {primary.hinduEquivalent && (
            <p className="text-xs text-muted-foreground mt-0.5 italic">
              Also observed as {primary.hinduEquivalent}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">{dateFormatted}</p>
          <p className="text-sm text-muted-foreground">{primary.deity}</p>
        </div>
        <div className="text-center flex-shrink-0">
          <div
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${isLingayat ? "" : "saffron-gradient"}`}
            style={isLingayat ? { background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)" } : undefined}
            data-testid="countdown-days"
          >
            <span className="text-white font-bold text-xl leading-none">{daysLeft}</span>
            <span className="text-white/80 text-xs">{t("home.days")}</span>
          </div>
        </div>
      </div>
      {secondary.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50" data-testid="next-vrat-secondary-list">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
            {t("home.alsoOnThisDay")}
          </p>
          <ul className="space-y-1.5">
            {secondary.map((v) => (
              <li
                key={v.id}
                className="flex items-baseline gap-2"
                data-testid={`next-vrat-secondary-${v.id}`}
              >
                <span className="text-muted-foreground text-xs leading-none mt-1">•</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{v.name}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{v.deity}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MantraCard({ vrats }: { vrats: Vrat[] }) {
  const [today, setToday] = useState(new Date());
  useEffect(() => { setToday(new Date()); }, []);

  const todayStr = today.toISOString().split("T")[0];
  const tradition = getUserTradition();
  const iskconBucket = getIskconRegionBucket(getUserLocation(), getUserRegion());
  const currentVrats = sortVratsPrimaryFirst(filterVratsByTradition(getVratsForDate(todayStr, iskconBucket), tradition));
  const nextVratData = getNextVratForTradition(today, tradition, iskconBucket);
  const displayVrat = currentVrats[0] || nextVratData?.vrat;

  if (!displayVrat) return null;

  return (
    <div data-testid="mantra-card" className="vrat-card p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        {tradition === "Jain" || displayVrat.tradition === "Jain"
          ? <JainSymbol className="text-green-600 w-5 h-6 flex-shrink-0" />
          : tradition === "Sikh" || displayVrat.tradition === "Sikh"
          ? <KhandaSvg className="w-5 h-5 flex-shrink-0" style={{ color: "#003DA5" }} />
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

function BadgeCelebration() {
  const { t } = useLanguage();
  const allVrats = filterVratsByTradition(getAllVrats(), getUserTradition());
  const [newBadges] = useState<BadgeResult[]>(() => {
    const badges = checkBadges(allVrats);
    return badges.filter((b) => b.newlyEarned);
  });

  useEffect(() => {
    if (newBadges.length > 0) {
      markBadgesSeen(newBadges.map((b) => b.id));
    }
  }, [newBadges]);

  if (newBadges.length === 0) return null;

  const badgeIcon = (id: string) =>
    id === "shubh-aarambh" ? "🪔" : id === "ekadashi-sevak" ? "🌙" : "🪷";

  return (
    <div className="mb-4">
      {newBadges.map((badge) => (
        <div
          key={badge.id}
          className="rounded-2xl p-5 mb-3 border-2"
          style={{
            background: "linear-gradient(135deg, #FEF3E2 0%, #FFF9F0 100%)",
            borderColor: "#E07B2A",
          }}
        >
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xl" aria-hidden="true">{badgeIcon(badge.id)}</span>
            <span className="font-serif font-bold text-foreground">{badge.name}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              {t("home.badgeEarned")}
            </span>
          </div>
          <p className="text-xs font-semibold text-amber-700 mb-1">{badge.subtitle}</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}

function MyStreaks() {
  const { t } = useLanguage();
  const allVrats = filterVratsByTradition(getAllVrats(), getUserTradition());
  const [, setLocation] = useLocation();
  const [streaks, setStreaks] = useState<StreakItem[]>(() => getTopStreaks(allVrats, 3));

  useEffect(() => {
    setStreaks(getTopStreaks(allVrats, 3));
  }, [allVrats]);

  return (
    <div className="vrat-card p-5 mb-4" data-testid="my-streaks-section">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          {t("home.topStreaks")}
        </p>
        <button
          onClick={() => setLocation("/vrat-history")}
          className="text-xs font-semibold"
          style={{ color: "#C86B1A" }}
          data-testid="view-history-link"
        >
          {t("nav.history")} →
        </button>
      </div>

      {streaks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-1">
          {t("home.noStreaks")}
        </p>
      ) : (
        <div className="space-y-2">
          {streaks.map((item) => (
            <div
              key={item.vrat.id}
              className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={
                item.isNirjala
                  ? {
                      background: "rgba(212,160,23,0.09)",
                      border: "2px solid #D4A017",
                    }
                  : { background: "rgba(224,123,42,0.08)" }
              }
            >
              <span className="text-sm font-medium text-foreground">{item.vrat.name}</span>
              <span className="text-sm font-bold" style={{ color: "#C86B1A" }}>
                🔥 {item.streak} {item.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// TRADITION_OPTIONS, TraditionIcon, and TraditionSwitcher all live in
// `@/components/TraditionSelector` so Home and Onboarding share the same
// data source, icons, labels, ordering, and dropdown UI.
function TraditionSwitcher() {
  return (
    <SharedTraditionSwitcher
      current={getUserTradition()}
      onSelect={(t) => {
        localStorage.setItem(TRADITION_KEY, t);
        window.location.reload();
      }}
    />
  );
}

export default function Home() {
  const [today] = useState(new Date());
  const todayStr = today.toISOString().split("T")[0];
  const userTradition = getUserTradition();
  const iskconBucket = getIskconRegionBucket(getUserLocation(), getUserRegion());
  const vratsToday = sortVratsPrimaryFirst(filterVratsByTradition(getVratsForDate(todayStr, iskconBucket), userTradition));
  const nextVrats = getNextVratsForTradition(today, userTradition, iskconBucket);

  const allVrats = vratsToday.length > 0 ? vratsToday : [];
  const nirjalaVrat = vratsToday.find(isNirjalaTimerVrat) ?? null;

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <NavratriCard todayStr={todayStr} />

        <LanguageSelector />

        <div className="text-center mb-4">
          <div className="flex items-end justify-center gap-4 mb-2">
            <TraditionIcon tradition={getUserTradition()} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">V<span style={{ color: "#FF9933" }}>RA</span>T</h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wide">Your Fast, Your Way</p>
          <TraditionSwitcher />
        </div>
        <BadgeCelebration />

        <TodayCard todayStr={todayStr} vratsToday={vratsToday} />
        {nirjalaVrat ? (
          <NirjalaFastTimer vrat={nirjalaVrat} />
        ) : (
          <FastingTimer vratsToday={vratsToday} />
        )}
        <HydrationTracker vratsToday={vratsToday} todayStr={todayStr} />
        <MyStreaks />
        <NextVratCard nextVrats={nextVrats} />
        <MantraCard vrats={allVrats} />
        {userTradition === "Sikh" ? <NanakshahiCard /> : <PanchangCard />}
        <BrahmaMuhurta />

        <TrialBanner />
        <DisclaimerBanner />
        <PageFooter />

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
