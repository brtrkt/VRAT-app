import { useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import type { Vrat } from "@/data/vrats";
import { useLanguage } from "@/contexts/LanguageContext";

function KhandaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 120" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M14 6 C3 34 3 64 20 83 C24 89 31 93 39 95" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M86 6 C97 34 97 64 80 83 C76 89 69 93 61 95" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="76" r="18" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M50 4 L43 50 L50 58 L57 50 Z" />
      <rect x="25" y="50" width="50" height="7" rx="3.5" />
      <rect x="47" y="58" width="6" height="22" rx="2" />
      <ellipse cx="50" cy="83" rx="7" ry="4" />
    </svg>
  );
}

// ─── localStorage ─────────────────────────────────────────────────────────────
const SANKALP_KEY = "vrat_sankalp_log_v1";

function getSankalpLog(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(SANKALP_KEY) || "{}");
  } catch {
    return {};
  }
}

export function markSankalpTaken(vratId: string): void {
  const log = getSankalpLog();
  const today = new Date().toISOString().split("T")[0];
  if (!log[today]) log[today] = [];
  if (!log[today].includes(vratId)) log[today].push(vratId);
  localStorage.setItem(SANKALP_KEY, JSON.stringify(log));
}

export function isSankalpTakenToday(vratId: string): boolean {
  const log = getSankalpLog();
  const today = new Date().toISOString().split("T")[0];
  return (log[today] || []).includes(vratId);
}

// ─── Sankalp data ─────────────────────────────────────────────────────────────
interface SankalpData {
  text: string;
  meaning: string;
  isJain?: boolean;
  isSikh?: boolean;
}

const SANKALP: Record<string, SankalpData> = {
  ekadashi: {
    text: "Om Adya Bhagavan Vishnu preethyartham,\nEkadashi Vratam Karishye",
    meaning:
      "Today, to please Lord Vishnu, I take the vow of Ekadashi fast.\nI will not consume grains or pulses.\nI will observe this fast with full devotion.",
  },
  navratri: {
    text: "Om Adya Devi Durgaa preethyartham,\nNavratri Vratam Karishye",
    meaning:
      "Today, to please Goddess Durga, I take the vow of Navratri fast for nine days.\nI surrender myself to the divine mother and seek her blessings.",
  },
  "maha-shivratri": {
    text: "Om Adya Mahadev preethyartham,\nShivratri Vratam Karishye",
    meaning:
      "Today, to please Lord Shiva, I take the vow of Shivratri fast.\nI will stay awake through the night in devotion and offer my prayers at each prahar.",
  },
  pradosh: {
    text: "Om Adya Shiva Parvathi preethyartham,\nPradosh Vratam Karishye",
    meaning:
      "Today, to please Lord Shiva and Goddess Parvati, I take the vow of Pradosh fast.\nI will worship during the Pradosh Kaal at sunset.",
  },
  purnima: {
    text: "Om Adya Satyanarayan preethyartham,\nPurnima Vratam Karishye",
    meaning:
      "Today, to please Lord Satyanarayan, I take the vow of Purnima fast.\nI will observe this fast with pure heart and offer my prayers to the full moon.",
  },
  "karva-chauth": {
    text: "Om Adya Shiva Parvathi preethyartham,\npati deerghaayu kaamnaa\nKarva Chauth Vratam Karishye",
    meaning:
      "Today, desiring a long life for my husband, I take the vow of Karva Chauth fast.\nI will not eat or drink until I sight the moon and my husband's face.",
  },
  sankashti: {
    text: "Om Adya Ganapataye preethyartham,\nSankashti Chaturthi Vratam Karishye",
    meaning:
      "Today, to please Lord Ganesha remover of all obstacles, I take the vow of Sankashti Chaturthi fast.\nI will break my fast only after sighting the moon.",
  },
  janmashtami: {
    text: "Om Adya Shri Krishna preethyartham,\nJanmashtami Vratam Karishye",
    meaning:
      "Today, to please Lord Krishna, I take the vow of Janmashtami fast.\nI will fast until midnight when Lord Krishna is born and break my fast with panchamrit.",
  },
  "vat-savitri": {
    text: "Om Adya Savitri preethyartham,\npati deerghaayu kaamnaa\nVat Savitri Vratam Karishye",
    meaning:
      "Today, following the example of Savitri, I take the vow of Vat Savitri fast for the long life of my husband.\nI will worship the banyan tree with full devotion.",
  },
  jain: {
    text: "Namo Arihantanam.\nI take this vow today in the presence of the Panch Parmeshti.",
    meaning:
      "I will observe this fast with ahimsa, truth and non-attachment.\nI will not consume food (or taste) until the designated time.\nMay this fast purify my karma.",
    isJain: true,
  },
  sikh: {
    text: "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh.\nI begin this day of simran and seva with gratitude and humility.",
    meaning:
      "The Khalsa belongs to Waheguru; all victory belongs to Waheguru.\nI dedicate this day to prayer (simran), selfless service (seva), and sharing in the langar.\nMay Waheguru's grace and kirpa guide every step.",
    isSikh: true,
  },
};

function getSankalpData(vrat: Vrat): SankalpData {
  if (vrat.tradition === "Jain") return SANKALP["jain"];
  if (vrat.tradition === "Sikh") return SANKALP["sikh"];

  const id = vrat.id;
  if (id.includes("ekadashi")) return SANKALP["ekadashi"];
  if (id.includes("navratri")) return SANKALP["navratri"];
  if (id === "maha-shivratri") return SANKALP["maha-shivratri"];
  if (id.includes("pradosh")) return SANKALP["pradosh"];
  if (id.includes("purnima")) return SANKALP["purnima"];
  if (id === "karva-chauth") return SANKALP["karva-chauth"];
  if (id.includes("sankashti")) return SANKALP["sankashti"];
  if (id === "janmashtami") return SANKALP["janmashtami"];
  if (id.includes("vat-savitri") || vrat.name.toLowerCase().includes("vat savitri"))
    return SANKALP["vat-savitri"];

  // Universal sankalp
  return {
    text: `Om Adya ${vrat.deity} preethyartham,\n${vrat.name} Vratam Karishye`,
    meaning: `Today, to please ${vrat.deity}, I take the vow of ${vrat.name} fast.\nI will observe this fast with full devotion and a pure heart.`,
  };
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface Props {
  vrat: Vrat;
  onClose: () => void;
}

export default function SankalpModal({ vrat, onClose }: Props) {
  const { t } = useLanguage();
  const sankalp = getSankalpData(vrat);
  const isJain = sankalp.isJain;
  const isSikh = sankalp.isSikh;
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    markSankalpTaken(vrat.id);
    setConfirmed(true);
    setTimeout(onClose, 2800);
  }

  const gradFrom = isJain ? "#052e16" : "#78350f";
  const gradTo   = isJain ? "#14532d" : "#92400e";
  const goldText = "#FDE68A";
  const creamText = "#FEF3C7";

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      data-testid="sankalp-modal"
      style={{
        background: `linear-gradient(160deg, ${gradFrom} 0%, ${gradTo} 60%, #1c1917 100%)`,
      }}
    >
      {/* Close button */}
      <div className="flex justify-end p-5 pt-safe">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.12)" }}
          aria-label="Close"
          data-testid="close-sankalp"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Flame / symbol */}
        <div className="text-center mb-6">
          <span className="text-5xl" aria-hidden="true">
            {isSikh ? <KhandaSvg className="w-12 h-12 inline-block" style={{ color: "#003DA5" }} /> : isJain ? "🤚" : "🪔"}
          </span>
          <p
            className="text-xs font-medium tracking-[0.2em] uppercase mt-3 mb-1"
            style={{ color: goldText, opacity: 0.7 }}
          >
            {isJain ? "Jain Sankalp" : "Sankalp"}
          </p>
          <h2
            className="font-serif text-2xl font-bold"
            style={{ color: goldText }}
          >
            {vrat.name}
          </h2>
        </div>

        {/* Horizontal rule */}
        <div
          className="w-16 h-px mx-auto mb-7"
          style={{ background: `${goldText}40` }}
        />

        {!confirmed ? (
          <>
            {/* Sanskrit / vow text */}
            <div className="mb-6 text-center">
              <p
                className="font-serif text-lg leading-relaxed whitespace-pre-line mb-1"
                style={{ color: goldText }}
                lang="sa"
              >
                {sankalp.text}
              </p>
            </div>

            {/* Divider */}
            <div
              className="w-12 h-px mx-auto mb-6"
              style={{ background: `${goldText}30` }}
            />

            {/* English meaning */}
            <div className="mb-8 text-center">
              <p
                className="text-sm leading-relaxed whitespace-pre-line italic"
                style={{ color: creamText, opacity: 0.85 }}
              >
                {sankalp.meaning}
              </p>
            </div>

            {/* Traditional note */}
            <div
              className="rounded-2xl px-4 py-3 mb-8 text-center"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{ color: creamText, opacity: 0.65 }}
              >
                After your morning bath, face east. Light a diya. Hold raw rice and Gangajal (or clean water) cupped in your right palm. Say your name, your city, your country, and your gotra — if your gotra is unknown, say Kashyap gotra. Recite the sankalp mantra above. Then gently pour the rice and water next to the diya — your vow is sealed. 🙏
              </p>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all active:scale-95"
              style={{
                background: isJain
                  ? "linear-gradient(135deg, #15803D 0%, #22C55E 100%)"
                  : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: isJain ? "#fff" : "#1c1917",
              }}
              data-testid="confirm-sankalp-btn"
            >
              {t("sankalp.confirm")}
            </button>
          </>
        ) : (
          /* Confirmation state */
          <div className="text-center py-8">
            <div className="text-5xl mb-5">🙏</div>
            <p
              className="font-serif text-xl font-bold mb-3 leading-snug"
              style={{ color: goldText }}
            >
              Your sankalp has been taken
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: creamText, opacity: 0.85 }}
            >
              May {vrat.deity} bless your fast today.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── "Take Sankalp" trigger button ───────────────────────────────────────────
export function SankalpButton({
  vrat,
  onOpen,
  isJain = false,
}: {
  vrat: Vrat;
  onOpen: () => void;
  isJain?: boolean;
}) {
  const { t } = useLanguage();
  const alreadyTaken = isSankalpTakenToday(vrat.id);
  const isSikh = vrat.tradition === "Sikh";

  if (alreadyTaken) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-2"
        style={{
          background: isSikh ? "rgba(0,61,165,0.08)" : isJain ? "rgba(22,163,74,0.10)" : "rgba(245,158,11,0.12)",
          border: isSikh ? "1px solid rgba(0,61,165,0.25)" : isJain ? "1px solid rgba(22,163,74,0.25)" : "1px solid rgba(245,158,11,0.3)",
        }}
        data-testid="sankalp-taken-badge"
      >
        <span className="text-lg" aria-hidden="true">🙏</span>
        <div>
          <p
            className="text-xs font-semibold"
            style={{ color: isSikh ? "#003DA5" : isJain ? "#15803D" : "#92400E" }}
          >
            {t("sankalp.taken")}
          </p>
          <p className="text-xs text-muted-foreground">
            May {vrat.deity} bless your fast
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-2 text-left transition-all active:scale-[0.98]"
      style={{
        background: isSikh
          ? "linear-gradient(135deg, rgba(0,61,165,0.10) 0%, rgba(0,82,204,0.07) 100%)"
          : isJain
          ? "linear-gradient(135deg, rgba(21,128,61,0.12) 0%, rgba(34,197,94,0.08) 100%)"
          : "linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(217,119,6,0.09) 100%)",
        border: isSikh
          ? "1px solid rgba(0,61,165,0.28)"
          : isJain
          ? "1px solid rgba(22,163,74,0.28)"
          : "1px solid rgba(245,158,11,0.35)",
      }}
      data-testid="take-sankalp-btn"
      aria-label="Take sankalp"
    >
      <span className="text-2xl flex-shrink-0" aria-hidden="true">
        {isSikh ? <KhandaSvg className="w-6 h-6 inline-block" style={{ color: "#003DA5" }} /> : isJain ? "🤚" : "🪔"}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: isSikh ? "#003DA5" : isJain ? "#15803D" : "#92400E" }}
        >
          {t("sankalp.take")}
        </p>
        <p className="text-xs text-muted-foreground">
          Begin your fast with intention and devotion
        </p>
      </div>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-4 h-4 text-muted-foreground flex-shrink-0"
        aria-hidden="true"
      >
        <path d="M7 10l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
