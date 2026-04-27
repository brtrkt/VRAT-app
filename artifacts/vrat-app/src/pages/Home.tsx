import { useState, useEffect, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { getVratsForDate, getNextVratForTradition, filterVratsByTradition, getDaysUntil, formatDateStr, getAllVrats } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PageFooter from "@/components/PageFooter";
import NirjalaWarning from "@/components/NirjalaWarning";
import NavratriCard from "@/components/NavratriCard";
import HydrationTracker from "@/components/HydrationTracker";
import { getDaysRemaining, getUserTradition, TRADITION_KEY, type Tradition } from "@/hooks/useUserPrefs";
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 838" className={className} style={style} aria-hidden="true">
      <path d="M 382.877 20.123 C 369.559 30.822, 345.376 45.962, 330.750 52.758 L 324 55.895 324 60.716 C 324 63.367, 325.121 70.478, 326.491 76.518 C 330.918 96.036, 331.246 95.385, 314.461 100.337 C 256.870 117.327, 191.500 172.746, 164.465 227.500 C 128.787 299.759, 133.953 392.025, 177.399 458.500 C 205.721 501.836, 258.627 543.384, 305.275 558.925 C 319.415 563.636, 319.789 564.487, 315.501 582.186 C 311.341 599.359, 309.421 597.713, 335.145 599.034 C 362.888 600.459, 359.904 596.918, 363.140 632.263 C 364.614 648.366, 366.925 648.221, 339.819 633.723 C 252.035 586.770, 204.974 549.771, 163.695 495.259 C 67.338 368.009, 85.097 234.198, 213 123.764 C 234.742 104.992, 234.667 103.873, 212.041 109.559 C 110.139 135.170, 38.463 217.919, 19.001 332.424 C -3.183 462.948, 77.786 612.592, 213.874 692.578 C 223.306 698.122, 229.221 704.156, 231.270 710.324 C 233.906 718.262, 236.150 716.989, 261 693.454 C 278.715 676.677, 287.385 669.523, 297.935 662.980 L 306.023 657.964 315.262 664.154 C 330.925 674.649, 347.391 686.178, 349.711 688.277 C 352.765 691.038, 351.984 692.143, 339.263 703.039 C 313.054 725.490, 308.858 729.378, 303.067 736.577 C 282.832 761.731, 290.623 784.971, 319.300 784.994 C 330.385 785.004, 333.416 782.872, 342.754 768.500 C 346.597 762.584, 352.819 754.927, 357.990 749.750 C 373.817 733.904, 377.458 740.437, 362.850 758.470 C 333.229 795.033, 383.820 841.515, 416.786 808.026 C 431.330 793.250, 431.601 775.970, 417.578 757.500 C 411.168 749.057, 410 746.910, 410 743.566 C 410 734.605, 425.868 749.290, 441.223 772.463 C 451.449 787.894, 469.510 790.098, 482.357 777.483 C 498.744 761.393, 491.697 745.849, 452.882 712.466 C 432.026 694.528, 428.655 691.121, 430.072 689.413 C 430.659 688.706, 441.041 681.316, 453.142 672.992 L 475.144 657.858 482.035 661.952 C 491.830 667.771, 501.058 675.358, 520.523 693.600 C 544.940 716.481, 546.929 717.777, 549.146 712.250 C 553.075 702.455, 555.873 699.765, 573.512 688.823 C 660.606 634.799, 723.719 555.962, 752.815 464.849 C 802.830 308.231, 705.681 131.137, 556.250 106.524 C 547.729 105.121, 550.304 108.484, 571.500 126.448 C 654.376 196.686, 688.599 278.271, 674.504 372 C 661.836 456.236, 588.780 548.821, 488.500 607.724 C 467.194 620.239, 420.825 645, 418.695 645 C 417.216 645, 419.673 608.756, 421.553 602.832 C 422.335 600.370, 423.498 600.193, 446.302 599.048 C 471.150 597.801, 470.002 598.724, 466.055 583.167 C 461.173 563.920, 460.979 564.315, 478.486 557.960 C 610.741 509.951, 674.863 366.463, 621.629 237.646 C 598.393 181.420, 529.902 119.704, 470.500 101.468 C 453.923 96.379, 453.151 96.050, 452.427 93.771 C 452.076 92.664, 453.259 84.451, 455.056 75.521 C 458.967 56.086, 459.278 57.164, 448.152 51.576 C 432.526 43.728, 411.049 30.140, 398.803 20.352 C 390.615 13.808, 390.737 13.809, 382.877 20.123 M 329.723 164.487 C 173.505 220.082, 164.045 413.813, 313.840 489.732 C 335.376 500.647, 334.660 501.050, 339.953 475 C 353.029 410.637, 357.976 316.778, 352.180 243 C 345.822 162.064, 344.963 159.063, 329.723 164.487 M 438.720 164.138 C 433.355 172.743, 426.995 257.397, 427.010 320 C 427.027 389.999, 430.285 424.681, 441.616 475.500 C 447.333 501.142, 445.886 499.900, 461.500 492.567 C 615.210 420.383, 612.274 229.328, 456.490 166.524 C 444.255 161.592, 440.613 161.102, 438.720 164.138" fill="currentColor" fillRule="evenodd" stroke="none" />
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

function LotusSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <ellipse cx="30" cy="16" rx="6" ry="12" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(45 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(90 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(135 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(180 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(225 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(270 30 30)" opacity="0.85" />
      <ellipse cx="30" cy="16" rx="6" ry="12" transform="rotate(315 30 30)" opacity="0.85" />
      <circle cx="30" cy="30" r="8" />
    </svg>
  );
}

function VaishnavaTilakSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 72" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M24 4 C12 4 8 16 8 28 L8 68 L16 68 L16 32 C16 20 19 12 24 12 C29 12 32 20 32 32 L32 68 L40 68 L40 28 C40 16 36 4 24 4 Z" />
      <ellipse cx="24" cy="38" rx="5" ry="10" fill="white" opacity="0.9" />
    </svg>
  );
}

function TrisulaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 68" className={className} style={style} fill="currentColor" aria-hidden="true">
      <rect x="21" y="26" width="6" height="38" rx="3"/>
      <path d="M24 2 C24 2 20 10 20 18 L28 18 C28 10 24 2 24 2Z"/>
      <path d="M11 8 C9 13 9 20 13 23 L18 23 L18 18 C14 18 12 14 13 10Z"/>
      <path d="M37 8 C39 13 39 20 35 23 L30 23 L30 18 C34 18 36 14 35 10Z"/>
      <rect x="11" y="20" width="26" height="4" rx="2"/>
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
          {nextVrat.vrat.hinduEquivalent && (
            <p className="text-xs text-muted-foreground mt-0.5 italic">
              Also observed as {nextVrat.vrat.hinduEquivalent}
            </p>
          )}
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
  const tradition = getUserTradition();
  const currentVrats = filterVratsByTradition(getVratsForDate(todayStr), tradition);
  const nextVratData = getNextVratForTradition(today, tradition);
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

const TRADITION_OPTIONS: { value: Tradition; label: string }[] = [
  { value: "Hindu",        label: "Hindu" },
  { value: "Jain",         label: "Jain" },
  { value: "Sikh",         label: "Sikh" },
  { value: "Swaminarayan", label: "Swaminarayan" },
  { value: "ISKCON",       label: "ISKCON" },
  { value: "Lingayat",     label: "Lingayat" },
  { value: "Both",         label: "Hindu + Jain" },
];

function TraditionSwitcher() {
  const [open, setOpen] = useState(false);
  const current = getUserTradition();
  const currentLabel = TRADITION_OPTIONS.find((o) => o.value === current)?.label ?? current;

  function select(t: Tradition) {
    localStorage.setItem(TRADITION_KEY, t);
    setOpen(false);
    window.location.reload();
  }

  return (
    <div className="relative flex justify-center mt-1 mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all active:opacity-70"
        style={{ background: "rgba(255,255,255,0.65)", borderColor: "#E5E7EB", color: "#78716C" }}
        aria-label="Switch tradition"
      >
        {currentLabel}
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={open ? "M1 7l4-4 4 4" : "M1 3l4 4 4-4"} />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-9 left-1/2 -translate-x-1/2 z-20 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden" style={{ minWidth: 170 }}>
            {TRADITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors active:bg-amber-50"
                style={{ color: opt.value === current ? "#E07B2A" : "#374151", background: opt.value === current ? "#FFF7ED" : "transparent" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [today] = useState(new Date());
  const todayStr = today.toISOString().split("T")[0];
  const userTradition = getUserTradition();
  const vratsToday = filterVratsByTradition(getVratsForDate(todayStr), userTradition);
  const nextVrat = getNextVratForTradition(today, userTradition);

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
              if (t === "Sikh")          return <KhandaSvg className="w-10 h-12" style={{ color: "#003DA5" }} />;
              if (t === "Jain")          return <JainSymbol className="text-green-600 w-7 h-9" />;
              if (t === "Hindu")         return <OmSymbol className="text-primary text-3xl" />;
              if (t === "Swaminarayan") return <LotusSvg className="w-10 h-10" style={{ color: "#C4972A" }} />;
              if (t === "ISKCON")        return <VaishnavaTilakSvg className="w-8 h-12" style={{ color: "#0284C7" }} />;
              if (t === "Lingayat")      return <TrisulaSvg className="w-8 h-11" style={{ color: "#9B2335" }} />;
              return (
                <>
                  <OmSymbol className="text-primary text-3xl" />
                  <JainSymbol className="text-green-600 w-7 h-9" />
                  <KhandaSvg className="w-10 h-12" style={{ color: "#003DA5" }} />
                </>
              );
            })()}
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">VRAT</h1>
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
        <NextVratCard nextVrat={nextVrat} />
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
