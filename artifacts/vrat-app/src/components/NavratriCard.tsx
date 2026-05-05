import { useState } from "react";
import { Share2 } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface DayInfo {
  colorName: string;
  swatch: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  deity: string;
  deityDesc: string;
  bhog: string;
  mantra: string;
  mantraTranslation: string;
}

const NAVRATRI_DAYS: DayInfo[] = [
  {
    colorName: "Red",
    swatch: "#DC2626",
    cardBg: "#FEE2E2",
    cardBorder: "#FECACA",
    textColor: "#7F1D1D",
    deity: "Shailputri",
    deityDesc: "Daughter of the Himalayas",
    bhog: "Pure ghee",
    mantra: "ॐ देवी शैलपुत्र्यै नमः",
    mantraTranslation: "I bow to Goddess Shailputri",
  },
  {
    colorName: "Royal Blue",
    swatch: "#1D4ED8",
    cardBg: "#DBEAFE",
    cardBorder: "#BFDBFE",
    textColor: "#1E3A5F",
    deity: "Brahmacharini",
    deityDesc: "The goddess of penance and devotion",
    bhog: "Sugar",
    mantra: "ॐ देवी ब्रह्मचारिण्यै नमः",
    mantraTranslation: "I bow to Goddess Brahmacharini",
  },
  {
    colorName: "Yellow",
    swatch: "#D97706",
    cardBg: "#FEF9C3",
    cardBorder: "#FEF08A",
    textColor: "#78350F",
    deity: "Chandraghanta",
    deityDesc: "The moon-crested warrior goddess",
    bhog: "Kheer",
    mantra: "ॐ देवी चन्द्रघण्टायै नमः",
    mantraTranslation: "I bow to Goddess Chandraghanta",
  },
  {
    colorName: "Green",
    swatch: "#15803D",
    cardBg: "#DCFCE7",
    cardBorder: "#BBF7D0",
    textColor: "#14532D",
    deity: "Kushmanda",
    deityDesc: "Creator of the universe",
    bhog: "Malpua",
    mantra: "ॐ देवी कूष्माण्डायै नमः",
    mantraTranslation: "I bow to Goddess Kushmanda",
  },
  {
    colorName: "Grey",
    swatch: "#6B7280",
    cardBg: "#F3F4F6",
    cardBorder: "#D1D5DB",
    textColor: "#1F2937",
    deity: "Skandamata",
    deityDesc: "Mother of Lord Kartikeya",
    bhog: "Banana",
    mantra: "ॐ देवी स्कन्दमातायै नमः",
    mantraTranslation: "I bow to Goddess Skandamata",
  },
  {
    colorName: "Orange",
    swatch: "#C2410C",
    cardBg: "#FFEDD5",
    cardBorder: "#FED7AA",
    textColor: "#7C2D12",
    deity: "Katyayani",
    deityDesc: "The fierce warrior goddess",
    bhog: "Honey",
    mantra: "ॐ देवी कात्यायन्यै नमः",
    mantraTranslation: "I bow to Goddess Katyayani",
  },
  {
    colorName: "White",
    swatch: "#D1D5DB",
    cardBg: "#F9FAFB",
    cardBorder: "#E5E7EB",
    textColor: "#374151",
    deity: "Kalaratri",
    deityDesc: "Destroyer of darkness and evil",
    bhog: "Jaggery",
    mantra: "ॐ देवी कालरात्र्यै नमः",
    mantraTranslation: "I bow to Goddess Kalaratri",
  },
  {
    colorName: "Pink",
    swatch: "#BE185D",
    cardBg: "#FCE7F3",
    cardBorder: "#FBCFE8",
    textColor: "#831843",
    deity: "Mahagauri",
    deityDesc: "The radiant, pure white goddess",
    bhog: "Coconut",
    mantra: "ॐ देवी महागौर्यै नमः",
    mantraTranslation: "I bow to Goddess Mahagauri",
  },
  {
    colorName: "Purple",
    swatch: "#7C3AED",
    cardBg: "#EDE9FE",
    cardBorder: "#DDD6FE",
    textColor: "#4C1D95",
    deity: "Siddhidatri",
    deityDesc: "Giver of all divine powers",
    bhog: "Sesame",
    mantra: "ॐ देवी सिद्धिदात्र्यै नमः",
    mantraTranslation: "I bow to Goddess Siddhidatri",
  },
];

// ─── Navratri periods ──────────────────────────────────────────────────────────

interface NavratriPeriod {
  start: string;
  label: string;
}

const NAVRATRI_PERIODS: NavratriPeriod[] = [
  { start: "2026-03-30", label: "Chaitra Navratri" },
  { start: "2026-10-03", label: "Sharad Navratri" },
  { start: "2027-03-19", label: "Chaitra Navratri" },
  { start: "2027-09-22", label: "Sharad Navratri" },
];

function getNavratriDay(todayStr: string): { day: number; label: string } | null {
  for (const period of NAVRATRI_PERIODS) {
    const start = new Date(period.start);
    const today = new Date(todayStr);
    const diff = Math.round(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff >= 0 && diff <= 8) {
      return { day: diff + 1, label: period.label };
    }
  }
  return null;
}

// ─── Canvas share card generator ──────────────────────────────────────────────

async function generateShareImage(d: DayInfo, dayNum: number): Promise<Blob> {
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = d.cardBg;
  ctx.fillRect(0, 0, size, size);

  // Decorative top band using swatch color
  ctx.fillStyle = d.swatch;
  ctx.fillRect(0, 0, size, 8);
  ctx.fillRect(0, size - 8, size, 8);

  // Large color circle
  const cx = size / 2;
  const cy = 400;
  const r = 180;
  ctx.fillStyle = d.swatch;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // White ring around circle
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 7, 0, Math.PI * 2);
  ctx.stroke();

  // "Navratri Day N"
  ctx.fillStyle = d.textColor;
  ctx.textAlign = "center";
  ctx.font = `bold 72px Georgia, 'Times New Roman', serif`;
  ctx.fillText("Navratri", cx, 130);

  ctx.font = `bold 58px Georgia, 'Times New Roman', serif`;
  ctx.fillText(`Day ${dayNum}`, cx, 210);

  // Color name below heading
  ctx.font = `40px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = d.swatch;
  ctx.fillText(d.colorName, cx, 268);

  // Deity name
  ctx.fillStyle = d.textColor;
  ctx.font = `bold 60px Georgia, 'Times New Roman', serif`;
  ctx.fillText(d.deity, cx, 650);

  // Deity description
  ctx.font = `34px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = d.textColor + "BB";
  ctx.fillText(d.deityDesc, cx, 710);

  // Bhog line
  ctx.font = `32px Arial, sans-serif`;
  ctx.fillStyle = d.textColor + "99";
  ctx.fillText(`Bhog: ${d.bhog}`, cx, 780);

  // Divider
  ctx.strokeStyle = d.swatch + "60";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 200, 840);
  ctx.lineTo(cx + 200, 840);
  ctx.stroke();

  // VRAT branding — V and T in tradition saffron-brown, RA highlighted in saffron #FF9933
  ctx.font = `bold 48px Georgia, 'Times New Roman', serif`;
  const wV  = ctx.measureText("V").width;
  const wRA = ctx.measureText("RA").width;
  const wT  = ctx.measureText("T").width;
  const totalW = wV + wRA + wT;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  let bx = cx - totalW / 2;
  ctx.fillStyle = "#E07B2A";
  ctx.fillText("V", bx, 920);
  bx += wV;
  ctx.fillStyle = "#FF9933";
  ctx.fillText("RA", bx, 920);
  bx += wRA;
  ctx.fillStyle = "#E07B2A";
  ctx.fillText("T", bx, 920);
  ctx.textAlign = prevAlign;

  ctx.font = `26px Arial, sans-serif`;
  ctx.fillStyle = "#B45309";
  ctx.fillText("Your fast. Your way.", cx, 962);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

// ─── NavratriCard component ───────────────────────────────────────────────────

export default function NavratriCard({ todayStr }: { todayStr: string }) {
  const [sharing, setSharing] = useState(false);

  const navratriInfo = getNavratriDay(todayStr);
  if (!navratriInfo) return null;

  const { day, label } = navratriInfo;
  const d = NAVRATRI_DAYS[day - 1];

  async function handleShare() {
    setSharing(true);
    try {
      const blob = await generateShareImage(d, day);
      const file = new File([blob], `navratri-day-${day}.png`, { type: "image/png" });
      const shareData = {
        title: `Navratri Day ${day} — ${d.colorName}`,
        text: `Today is Navratri Day ${day}! 🌸 Goddess ${d.deity}. Wear ${d.colorName} today. Offering: ${d.bhog}.\n\nJai Mata Di! 🙏\n\nShared from VRAT app`,
        files: [file],
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `navratri-day-${day}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <div
      className="rounded-3xl mb-6 overflow-hidden"
      style={{
        background: d.cardBg,
        border: `1.5px solid ${d.cardBorder}`,
      }}
      data-testid="navratri-card"
      role="region"
      aria-label={`${label} Day ${day}`}
    >
      {/* Coloured top accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: d.swatch }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-0.5"
              style={{ color: d.swatch }}
            >
              {label}
            </p>
            <h2
              className="font-serif text-2xl font-bold leading-tight"
              style={{ color: d.textColor }}
            >
              Day {day} of 9
            </h2>
          </div>
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full font-serif font-bold text-xl text-white flex-shrink-0"
            style={{ backgroundColor: d.swatch }}
            aria-hidden="true"
          >
            {day}
          </div>
        </div>

        {/* Color swatch + name */}
        <div className="flex items-center gap-4 mb-4 bg-white/50 rounded-2xl p-3">
          <div
            className="w-16 h-16 rounded-2xl flex-shrink-0 shadow-sm"
            style={{
              backgroundColor: d.swatch,
              border: d.colorName === "White" ? "2px solid #D1D5DB" : "none",
            }}
            aria-label={`Today's colour: ${d.colorName}`}
          />
          <div>
            <p className="text-xs font-medium tracking-widest uppercase" style={{ color: d.swatch }}>
              Today's colour
            </p>
            <p className="font-serif text-2xl font-semibold mt-0.5" style={{ color: d.textColor }}>
              {d.colorName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: d.textColor + "99" }}>
              Wear this colour today
            </p>
          </div>
        </div>

        {/* Deity + Bhog row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/50 rounded-2xl p-3">
            <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: d.swatch }}>
              Today's Goddess
            </p>
            <p className="font-serif font-semibold text-base leading-tight" style={{ color: d.textColor }}>
              {d.deity}
            </p>
            <p className="text-xs mt-1 leading-snug" style={{ color: d.textColor + "99" }}>
              {d.deityDesc}
            </p>
          </div>
          <div className="bg-white/50 rounded-2xl p-3">
            <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: d.swatch }}>
              Today's Bhog
            </p>
            <p className="font-serif font-semibold text-base capitalize" style={{ color: d.textColor }}>
              {d.bhog}
            </p>
            <p className="text-xs mt-1 leading-snug" style={{ color: d.textColor + "99" }}>
              Offering for {d.deity}
            </p>
          </div>
        </div>

        {/* Mantra block */}
        <div
          className="rounded-2xl px-4 py-3 mb-4 text-center"
          style={{ background: `${d.swatch}15`, border: `1px solid ${d.swatch}30` }}
        >
          <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: d.swatch }}>
            Today's Mantra
          </p>
          <p
            className="font-serif text-xl leading-relaxed"
            style={{ color: d.textColor }}
            lang="hi"
          >
            {d.mantra}
          </p>
          <p className="text-xs italic mt-1" style={{ color: d.textColor + "BB" }}>
            {d.mantraTranslation}
          </p>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={sharing}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm tracking-wide transition-all active:scale-98 disabled:opacity-60"
          style={{
            backgroundColor: d.swatch,
            color: "white",
            opacity: sharing ? 0.6 : 1,
          }}
          aria-label={`Share Navratri Day ${day} card to WhatsApp or Instagram`}
        >
          <Share2 size={16} />
          {sharing ? "Preparing card…" : "Share today's colour"}
        </button>
      </div>
    </div>
  );
}
