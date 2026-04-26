import { useState, useEffect, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { getVratsForDate, getNextVrat, getDaysUntil, formatDateStr, getAllVrats } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PageFooter from "@/components/PageFooter";
import NirjalaWarning from "@/components/NirjalaWarning";
import NavratriCard from "@/components/NavratriCard";
import HydrationTracker from "@/components/HydrationTracker";
import { getDaysRemaining, getUserTradition } from "@/hooks/useUserPrefs";
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
import { useLanguage } from "@/contexts/LanguageContext";

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

function BrahmaMuhurta() {
  const { t } = useLanguage();
  const alarmHour = 3;
  const alarmMin = 30;

  const isAndroid = /android/i.test(navigator.userAgent);
  const alarmUrl =
    `intent:#Intent;action=android.intent.action.SET_ALARM;` +
    `S.android.intent.extra.alarm.MESSAGE=Brahma%20Muhurta;` +
    `i.android.intent.extra.alarm.HOUR=${alarmHour};` +
    `i.android.intent.extra.alarm.MINUTES=${alarmMin};` +
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
          {t("home.brahmaTitle")}
        </p>
      </div>
      <p className="text-foreground text-sm leading-relaxed mb-2">
        <span className="font-serif font-semibold text-base text-amber-900">
          3:30 AM – 5:00 AM
        </span>
        {" "}{t("home.brahmaDesc")}{" "}
        {isAndroid ? (
          <a
            href={alarmUrl}
            className="text-amber-700 underline underline-offset-2 font-semibold hover:text-amber-900 transition-colors"
            data-testid="alarm-link"
            aria-label="Open Clock app to set alarm for Brahma Muhurta at 3:30 AM"
          >
            {t("home.brahmaAlarm")}
          </a>
        ) : (
          <span className="text-amber-700 font-semibold">
            {t("home.brahmaAlarmIos")}
          </span>
        )}
      </p>
      <p className="text-xs text-amber-600/60 mt-1">
        {t("home.brahmaNote")}
      </p>
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

function KhandaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 120" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M18 8 C8 35 10 68 30 88" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="8" r="4.5" />
      <path d="M82 8 C92 35 90 68 70 88" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="82" cy="8" r="4.5" />
      <circle cx="50" cy="80" r="22" fill="none" stroke="currentColor" strokeWidth="7" />
      <path d="M50 6 L44 46 L50 54 L56 46 Z" />
      <rect x="30" y="42" width="40" height="7" rx="3.5" />
      <rect x="47" y="54" width="6" height="18" rx="2" />
      <ellipse cx="50" cy="74" rx="6" ry="4" />
    </svg>
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

function NextVratCard({ nextVrat }: { nextVrat: { vrat: Vrat; date: string } | null }) {
  const { t } = useLanguage();
  if (!nextVrat) return null;

  const daysLeft = getDaysUntil(nextVrat.date, new Date());
  const dateFormatted = formatDateStr(nextVrat.date);

  return (
    <div data-testid="next-vrat-card" className="vrat-card p-5 mb-4">
      <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
        {t("home.nextFast")}
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
            <span className="text-white/80 text-xs">{t("home.days")}</span>
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
          : displayVrat.tradition === "Sikh"
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
  const allVrats = getAllVrats();
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
  const allVrats = getAllVrats();
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

export default function Home() {
  const [today] = useState(new Date());
  const todayStr = today.toISOString().split("T")[0];
  const vratsToday = getVratsForDate(todayStr);
  const nextVrat = getNextVrat(today);

  const allVrats = vratsToday.length > 0 ? vratsToday : [];
  const nirjalaVrat = vratsToday.find(isNirjalaTimerVrat) ?? null;

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <NavratriCard todayStr={todayStr} />

        <LanguageSelector />

        <div className="text-center mb-4">
          <div className="flex items-end justify-center gap-4 mb-2">
            {(() => {
              const t = getUserTradition();
              if (t === "Sikh")  return <KhandaSvg className="w-10 h-12" style={{ color: "#003DA5" }} />;
              if (t === "Jain")  return <JainSymbol className="text-green-600 w-7 h-9" />;
              if (t === "Hindu") return <OmSymbol className="text-primary text-3xl" />;
              return (
                <>
                  <OmSymbol className="text-primary text-3xl" />
                  <JainSymbol className="text-green-600 w-7 h-9" />
                </>
              );
            })()}
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">VRAT</h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wide">Your Fast, Your Way</p>
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
        <NextVratCard nextVrat={nextVrat} />
        <MantraCard vrats={allVrats} />
        <PanchangCard />
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
