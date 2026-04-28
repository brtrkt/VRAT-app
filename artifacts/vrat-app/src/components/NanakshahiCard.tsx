import { getVratsForDate, getNextVratForTradition, getDaysUntil, formatDateStr, filterVratsByTradition, getIskconRegionBucket } from "@/data/vrats";
import { getUserLocation, getUserRegion } from "@/hooks/useUserPrefs";

// ─── Nanakshahi month definitions ─────────────────────────────────────────────
// Each entry = the Gregorian start date of that Nanakshahi month.
// Derived from the Sangrand dates in vrats.ts.
const NS_MONTHS: { name: string; punjabi: string; start: string; ns: number }[] = [
  { name: "Magh",    punjabi: "ਮਾਘ",  start: "2026-01-13", ns: 557 },
  { name: "Phagun", punjabi: "ਫੱਗਣ", start: "2026-02-12", ns: 557 },
  { name: "Chet",   punjabi: "ਚੇਤ",  start: "2026-03-14", ns: 558 },
  { name: "Vaisakh",punjabi: "ਵੈਸਾਖ",start: "2026-04-14", ns: 558 },
  { name: "Jeth",   punjabi: "ਜੇਠ",  start: "2026-05-15", ns: 558 },
  { name: "Harh",   punjabi: "ਹਾੜ",  start: "2026-06-15", ns: 558 },
  { name: "Sawan",  punjabi: "ਸਾਵਣ", start: "2026-07-16", ns: 558 },
  { name: "Bhadon", punjabi: "ਭਾਦੋਂ",start: "2026-08-16", ns: 558 },
  { name: "Asu",    punjabi: "ਅੱਸੂ", start: "2026-09-15", ns: 558 },
  { name: "Katik",  punjabi: "ਕੱਤਕ", start: "2026-10-15", ns: 558 },
  { name: "Maghar", punjabi: "ਮੱਘਰ", start: "2026-11-14", ns: 558 },
  { name: "Poh",    punjabi: "ਪੋਹ",  start: "2026-12-14", ns: 558 },
  { name: "Magh",   punjabi: "ਮਾਘ",  start: "2027-01-13", ns: 559 },
  { name: "Phagun",punjabi: "ਫੱਗਣ", start: "2027-02-12", ns: 559 },
  { name: "Chet",   punjabi: "ਚੇਤ",  start: "2027-03-14", ns: 559 },
];

interface NanakshahiDate {
  monthName: string;
  monthPunjabi: string;
  day: number;
  ns: number;
}

function getNanakshahiDate(today: Date): NanakshahiDate | null {
  const todayStr = today.toISOString().split("T")[0];

  // Find the month whose start <= today < next month start
  for (let i = NS_MONTHS.length - 1; i >= 0; i--) {
    if (todayStr >= NS_MONTHS[i].start) {
      const start = new Date(NS_MONTHS[i].start + "T00:00:00");
      const msPerDay = 24 * 60 * 60 * 1000;
      const day = Math.floor((today.getTime() - start.getTime()) / msPerDay) + 1;
      return {
        monthName: NS_MONTHS[i].name,
        monthPunjabi: NS_MONTHS[i].punjabi,
        day,
        ns: NS_MONTHS[i].ns,
      };
    }
  }
  return null;
}

// ─── Khanda SVG (inline, small) ───────────────────────────────────────────────
function KhandaMini() {
  return (
    <svg viewBox="0 0 780 838" className="w-4 h-4 flex-shrink-0" aria-hidden="true" style={{ color: "#F4A900" }}>
      <path fill="currentColor" d="M 382.877 20.123 C 369.559 30.822, 345.376 45.962, 330.750 52.758 L 324 55.895 324 60.716 C 324 63.367, 325.121 70.478, 326.491 76.518 C 330.918 96.036, 331.246 95.385, 314.461 100.337 C 256.870 117.327, 191.500 172.746, 164.465 227.500 C 128.787 299.759, 133.953 392.025, 177.399 458.500 C 205.721 501.836, 258.627 543.384, 305.275 558.925 C 319.415 563.636, 319.789 564.487, 315.501 582.186 C 311.341 599.359, 309.421 597.713, 335.145 599.034 C 362.888 600.459, 359.904 596.918, 363.140 632.263 C 364.614 648.366, 366.925 648.221, 339.819 633.723 C 252.035 586.770, 204.974 549.771, 163.695 495.259 C 67.338 368.009, 85.097 234.198, 213 123.764 C 234.742 104.992, 234.667 103.873, 212.041 109.559 C 110.139 135.170, 38.463 217.919, 19.001 332.424 C -3.183 462.948, 77.786 612.592, 213.874 692.578 C 223.306 698.122, 229.221 704.156, 231.270 710.324 C 233.906 718.262, 236.150 716.989, 261 693.454 C 278.715 676.677, 287.385 669.523, 297.935 662.980 L 306.023 657.964 315.262 664.154 C 330.925 674.649, 347.391 686.178, 349.711 688.277 C 352.765 691.038, 351.984 692.143, 339.263 703.039 C 313.054 725.490, 308.858 729.378, 303.067 736.577 C 282.832 761.731, 290.623 784.971, 319.300 784.994 C 330.385 785.004, 333.416 782.872, 342.754 768.500 C 346.597 762.584, 352.819 754.927, 357.990 749.750 C 373.817 733.904, 377.458 740.437, 362.850 758.470 C 333.229 795.033, 383.820 841.515, 416.786 808.026 C 431.330 793.250, 431.601 775.970, 417.578 757.500 C 411.168 749.057, 410 746.910, 410 743.566 C 410 734.605, 425.868 749.290, 441.223 772.463 C 451.449 787.894, 469.510 790.098, 482.357 777.483 C 498.744 761.393, 491.697 745.849, 452.882 712.466 C 432.026 694.528, 428.655 691.121, 430.072 689.413 C 430.659 688.706, 441.041 681.316, 453.142 672.992 L 475.144 657.858 482.035 661.952 C 491.830 667.771, 501.058 675.358, 520.523 693.600 C 544.940 716.481, 546.929 717.777, 549.146 712.250 C 553.075 702.455, 555.873 699.765, 573.512 688.823 C 660.606 634.799, 723.719 555.962, 752.816 461 C 781.861 366.206, 769.645 261.916, 719.500 176 C 680.793 108.498, 614.552 57.482, 539 32.679 C 517.613 25.545, 480.065 18.008, 462.500 17.500 C 445.001 16.993, 396 7.424, 396 5.206 C 396 2.987, 390.195 13.424, 382.877 20.123 M 358 636.428 C 358 636.736, 362.025 640.236, 366.944 644.196 L 375.889 651.407 383.944 645.578 C 388.375 642.371, 392 638.986, 392 638.075 C 392 637.163, 387.625 633.721, 382.278 630.418 C 373.471 624.979, 371.648 624.757, 365.324 628.201 C 361.448 630.325, 358 636.120, 358 636.428" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NanakshahiCard() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const nsDate = getNanakshahiDate(now);

  // Today's Sikh observances (if any)
  const iskconBucket = getIskconRegionBucket(getUserLocation(), getUserRegion());
  const sikhToday = filterVratsByTradition(getVratsForDate(todayStr, iskconBucket), "Sikh");

  // Next upcoming Sikh observance/Gurpurab
  const nextSikh = getNextVratForTradition(now, "Sikh", iskconBucket);

  return (
    <div
      className="rounded-3xl p-5 mb-4"
      data-testid="nanakshahi-card"
      style={{
        background: "linear-gradient(135deg, #0A2472 0%, #003DA5 100%)",
        border: "1px solid rgba(244,169,0,0.25)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "#F4A900" }}>
          Nanakshahi Calendar
        </p>
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
          ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ
        </span>
      </div>

      {/* Month + Year tiles */}
      {nsDate ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: "rgba(244,169,0,0.14)" }}
            >
              <p className="text-xs font-medium mb-0.5" style={{ color: "#F4A900" }}>Month</p>
              <p className="font-serif text-base font-bold text-white">{nsDate.monthName}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{nsDate.monthPunjabi}</p>
            </div>
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs font-medium mb-0.5" style={{ color: "#F4A900" }}>Nanakshahi Samvat</p>
              <p className="font-serif text-base font-bold text-white">{nsDate.ns}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                {nsDate.monthName} {nsDate.day}, NS {nsDate.ns}
              </p>
            </div>
          </div>

          {/* Today's observance */}
          {sikhToday.length > 0 ? (
            <div
              className="rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2.5"
              style={{ background: "rgba(244,169,0,0.18)" }}
            >
              <KhandaMini />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {sikhToday.map(v => v.name).join(" · ")}
                </p>
                {sikhToday[0].punjabiName && (
                  <p className="text-xs truncate" style={{ color: "#F4A900" }}>
                    {sikhToday[0].punjabiName}
                  </p>
                )}
              </div>
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "#F4A900", color: "#0A2472" }}
              >
                Today
              </span>
            </div>
          ) : null}

          {/* Next Gurpurab */}
          {nextSikh && nextSikh.date !== todayStr && (
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-2.5"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <KhandaMini />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/70 font-medium">Upcoming Gurpurab</p>
                <p className="text-xs font-semibold text-white truncate mt-0.5">
                  {nextSikh.vrat.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>
                  {formatDateStr(nextSikh.date)}
                </p>
              </div>
              <span
                className="text-xs font-bold px-2 py-1 rounded-xl flex-shrink-0"
                style={{ background: "rgba(244,169,0,0.18)", color: "#F4A900" }}
              >
                {getDaysUntil(nextSikh.date, now)}d
              </span>
            </div>
          )}

          {/* Today IS next Gurpurab */}
          {nextSikh && nextSikh.date === todayStr && sikhToday.length === 0 && (
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-2.5"
              style={{ background: "rgba(244,169,0,0.18)" }}
            >
              <KhandaMini />
              <p className="text-xs font-semibold text-white">{nextSikh.vrat.name}</p>
              <span className="ml-auto text-xs font-semibold" style={{ color: "#F4A900" }}>Today</span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-white/60 text-center py-2">
          Nanakshahi date unavailable
        </p>
      )}

      <p className="text-xs mt-3 text-right" style={{ color: "rgba(255,255,255,0.30)" }}>
        Nanakshahi Samvat · Sikh Solar Calendar
      </p>
    </div>
  );
}
