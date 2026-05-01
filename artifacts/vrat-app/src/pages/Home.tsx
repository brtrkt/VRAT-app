import { useState, useEffect, type CSSProperties } from "react";
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
      <ellipse cx="30" cy="24" rx="5" ry="14" opacity="0.9" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-28 30 42)" opacity="0.85" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(28 30 42)" opacity="0.85" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-58 30 42)" opacity="0.75" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(58 30 42)" opacity="0.75" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-85 30 42)" opacity="0.6" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(85 30 42)" opacity="0.6" />
      <circle cx="30" cy="42" r="7" />
    </svg>
  );
}

function IskconLogoSvg({ className = "" }: { className?: string; style?: CSSProperties }) {
  return (
    <img src="/iskcon_logo.svg" className={className} alt="ISKCON" style={{ objectFit: "contain" }} />
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

function PeacockFeatherSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 72" className={className} style={style} fill="currentColor" aria-hidden="true">
      <rect x="22" y="34" width="4" height="36" rx="2"/>
      <ellipse cx="24" cy="18" rx="14" ry="20" opacity="0.2"/>
      <ellipse cx="24" cy="18" rx="10" ry="14"/>
      <ellipse cx="24" cy="18" rx="5" ry="7" fill="white" opacity="0.85"/>
      <ellipse cx="24" cy="18" rx="2.5" ry="3.5"/>
    </svg>
  );
}

// ─── Tradition-specific silhouette icons (Warkari, Ramanandi, SriVaishnava,
//     Shakta, ShaivaSiddhanta, PushtiMarg, Lingayat) ───────────────────────────
function VitthalSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M22 4 L26 1 L30 4 L34 1 L38 4 L37 10 L23 10 Z"/>
      <circle cx="30" cy="15" r="5"/>
      <path d="M27 19 L33 19 L37 22 L44 26 L44 30 L40 31 L36 28 L36 40 L24 40 L24 28 L20 31 L16 30 L16 26 L23 22 Z"/>
      <path d="M24 40 L36 40 L38 58 L22 58 Z"/>
      <rect x="25" y="58" width="4" height="14"/>
      <rect x="31" y="58" width="4" height="14"/>
      <rect x="14" y="72" width="32" height="6" rx="1"/>
    </svg>
  );
}

// Urdhva Pundra — the canonical Vaishnav tilak worn by Ramanandi sadhus
// across Ayodhya, Chitrakoot, and Janakpur. The white "U" represents the
// lotus feet of Vishnu / Sri Ram; the central red vertical line (shrivatsa
// flame) represents Devi Sita / Lakshmi; the red bindu at the base
// represents the devotee's surrendered head at the Lord's feet.
function UrdhvaPundraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 64" className={className} style={style} aria-hidden="true">
      <path
        d="M5 4 H17 V40 Q17 44 21 44 H27 Q31 44 31 40 V4 H43 V42 Q43 56 31 56 H17 Q5 56 5 42 Z"
        fill="white"
      />
      <path
        d="M24 3 Q19 18 21 32 Q22 40 24 46 Q26 40 27 32 Q29 18 24 3 Z"
        fill="#DC2626"
      />
      <circle cx="24" cy="60" r="3.4" fill="#DC2626" />
    </svg>
  );
}

function NaamamSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="17" y1="6" x2="17" y2="55" stroke="currentColor" strokeWidth="6.5"/>
      <line x1="43" y1="6" x2="43" y2="55" stroke="currentColor" strokeWidth="6.5"/>
      <path d="M14 55 C14 74 46 74 46 55" stroke="currentColor" strokeWidth="6.5"/>
      <line x1="30" y1="10" x2="30" y2="62" stroke="#DC2626" strokeWidth="6.5"/>
    </svg>
  );
}

function SriYantraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="30" cy="30" r="27" strokeWidth="1.5"/>
      <polygon points="30,8 8,46 52,46"/>
      <polygon points="30,52 8,14 52,14"/>
      <polygon points="30,15 14,40 46,40"/>
      <polygon points="30,45 14,20 46,20"/>
      <circle cx="30" cy="30" r="2.5" fill="currentColor"/>
    </svg>
  );
}

function TripundraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <rect x="6" y="18" width="48" height="4" rx="2"/>
      <rect x="6" y="28" width="48" height="4" rx="2"/>
      <rect x="6" y="38" width="48" height="4" rx="2"/>
      <circle cx="30" cy="30" r="3"/>
    </svg>
  );
}

function ShrinathjiSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M14 8 Q22 2 28 5 Q34 1 40 5 Q48 2 50 9 Q49 13 44 13 L18 13 Q12 13 14 8 Z"/>
      <rect x="22" y="12" width="4" height="22" rx="2"/>
      <path d="M28 26 L30 22 L32 25 L34 21 L36 25 L38 22 L40 26 Z"/>
      <ellipse cx="34" cy="32" rx="5" ry="6"/>
      <path d="M27 38 L41 38 L41 60 L27 60 Z"/>
      <rect x="41" y="38" width="3.5" height="20" rx="1.5"/>
      <path d="M25 60 L43 60 L46 76 L22 76 Z"/>
    </svg>
  );
}

function IshtalingaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <circle cx="30" cy="28" r="14"/>
      <ellipse cx="25" cy="22" rx="3.5" ry="2.5" fill="white" opacity="0.4"/>
      <path d="M6 38 C6 50 16 56 30 56 C44 56 54 50 54 38 L50 38 C50 47 41 52 30 52 C19 52 10 47 10 38 Z"/>
    </svg>
  );
}

function KhejriTreeSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M0 50 Q15 44 30 48 Q45 52 60 46 L60 60 L0 60 Z" opacity="0.45"/>
      <path d="M28 50 L28 28 Q27 22 30 20 Q33 22 32 28 L32 50 Z"/>
      <circle cx="30" cy="16" r="9"/>
      <circle cx="20" cy="20" r="7"/>
      <circle cx="40" cy="20" r="7"/>
      <circle cx="24" cy="12" r="5"/>
      <circle cx="36" cy="12" r="5"/>
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
  const isLingayat = getUserTradition() === "Lingayat";

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

// Order: Hindu / Jain / Sikh first (umbrella categories),
// then the remaining 9 sub-traditions alphabetically.
const TRADITION_OPTIONS: { value: Tradition; label: string }[] = [
  { value: "Hindu",            label: "Hindu" },
  { value: "Jain",             label: "Jain" },
  { value: "Sikh",             label: "Sikh" },
  { value: "Bishnoi",          label: "Bishnoi" },
  { value: "ISKCON",           label: "ISKCON" },
  { value: "Lingayat",         label: "Lingayat" },
  { value: "PushtiMarg",       label: "Pushti Marg" },
  { value: "Ramanandi",        label: "Ramanandi" },
  { value: "ShaivaSiddhanta",  label: "Shaiva Siddhanta" },
  { value: "Shakta",           label: "Shakta" },
  { value: "SriVaishnava",     label: "Sri Vaishnava" },
  { value: "Swaminarayan",     label: "Swaminarayan" },
  { value: "Warkari",          label: "Warkari" },
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
        className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full font-medium border transition-all active:opacity-70"
        style={{ background: "rgba(255,255,255,0.65)", borderColor: "#E5E7EB", color: "#78716C", fontSize: "17px" }}
        aria-label="Switch tradition"
      >
        {currentLabel}
        <svg viewBox="0 0 10 10" className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={open ? "M1 7l4-4 4 4" : "M1 3l4 4 4-4"} />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-[52px] left-1/2 -translate-x-1/2 z-20 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden" style={{ minWidth: 220 }}>
            {TRADITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className="w-full text-left px-4 py-3 min-h-[44px] font-medium transition-colors active:bg-amber-50"
                style={{ color: opt.value === current ? "#E07B2A" : "#374151", background: opt.value === current ? "#FFF7ED" : "transparent", fontSize: "17px" }}
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
            {(() => {
              const t = getUserTradition();
              if (t === "Sikh")          return <KhandaSvg className="w-10 h-12" style={{ color: "#003DA5" }} />;
              if (t === "Jain")          return <JainSymbol className="text-green-600 w-7 h-9" />;
              if (t === "Hindu")         return <OmSymbol className="text-primary text-3xl" />;
              if (t === "Swaminarayan") return <LotusSvg className="w-10 h-10" style={{ color: "#C4972A" }} />;
              if (t === "ISKCON")        return <IskconLogoSvg className="w-16 h-16" />;
              if (t === "Lingayat")        return <IshtalingaSvg className="w-11 h-11" style={{ color: "#9B2335" }} />;
              if (t === "PushtiMarg")      return <ShrinathjiSvg className="w-9 h-12" style={{ color: "#0E7490" }} />;
              if (t === "Warkari")         return <VitthalSvg className="w-9 h-12" style={{ color: "#DC6803" }} />;
              if (t === "Ramanandi")       return <UrdhvaPundraSvg className="w-11 h-11" />;
              if (t === "SriVaishnava")    return <NaamamSvg className="w-9 h-12" style={{ color: "#B45309" }} />;
              if (t === "Shakta")          return <SriYantraSvg className="w-11 h-11" style={{ color: "#BE185D" }} />;
              if (t === "ShaivaSiddhanta") return <TripundraSvg className="w-11 h-11" style={{ color: "#475569" }} />;
              if (t === "Bishnoi")         return <KhejriTreeSvg className="w-11 h-11" style={{ color: "#16A34A" }} />;
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
