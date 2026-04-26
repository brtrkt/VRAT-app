import { useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import type { Vrat } from "@/data/vrats";
import { useLanguage } from "@/contexts/LanguageContext";

function KhandaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 838" className={className} style={style} aria-hidden="true">
      <path d="M 382.877 20.123 C 369.559 30.822, 345.376 45.962, 330.750 52.758 L 324 55.895 324 60.716 C 324 63.367, 325.121 70.478, 326.491 76.518 C 330.918 96.036, 331.246 95.385, 314.461 100.337 C 256.870 117.327, 191.500 172.746, 164.465 227.500 C 128.787 299.759, 133.953 392.025, 177.399 458.500 C 205.721 501.836, 258.627 543.384, 305.275 558.925 C 319.415 563.636, 319.789 564.487, 315.501 582.186 C 311.341 599.359, 309.421 597.713, 335.145 599.034 C 362.888 600.459, 359.904 596.918, 363.140 632.263 C 364.614 648.366, 366.925 648.221, 339.819 633.723 C 252.035 586.770, 204.974 549.771, 163.695 495.259 C 67.338 368.009, 85.097 234.198, 213 123.764 C 234.742 104.992, 234.667 103.873, 212.041 109.559 C 110.139 135.170, 38.463 217.919, 19.001 332.424 C -3.183 462.948, 77.786 612.592, 213.874 692.578 C 223.306 698.122, 229.221 704.156, 231.270 710.324 C 233.906 718.262, 236.150 716.989, 261 693.454 C 278.715 676.677, 287.385 669.523, 297.935 662.980 L 306.023 657.964 315.262 664.154 C 330.925 674.649, 347.391 686.178, 349.711 688.277 C 352.765 691.038, 351.984 692.143, 339.263 703.039 C 313.054 725.490, 308.858 729.378, 303.067 736.577 C 282.832 761.731, 290.623 784.971, 319.300 784.994 C 330.385 785.004, 333.416 782.872, 342.754 768.500 C 346.597 762.584, 352.819 754.927, 357.990 749.750 C 373.817 733.904, 377.458 740.437, 362.850 758.470 C 333.229 795.033, 383.820 841.515, 416.786 808.026 C 431.330 793.250, 431.601 775.970, 417.578 757.500 C 411.168 749.057, 410 746.910, 410 743.566 C 410 734.605, 425.868 749.290, 441.223 772.463 C 451.449 787.894, 469.510 790.098, 482.357 777.483 C 498.744 761.393, 491.697 745.849, 452.882 712.466 C 432.026 694.528, 428.655 691.121, 430.072 689.413 C 430.659 688.706, 441.041 681.316, 453.142 672.992 L 475.144 657.858 482.035 661.952 C 491.830 667.771, 501.058 675.358, 520.523 693.600 C 544.940 716.481, 546.929 717.777, 549.146 712.250 C 553.075 702.455, 555.873 699.765, 573.512 688.823 C 660.606 634.799, 723.719 555.962, 752.815 464.849 C 802.830 308.231, 705.681 131.137, 556.250 106.524 C 547.729 105.121, 550.304 108.484, 571.500 126.448 C 654.376 196.686, 688.599 278.271, 674.504 372 C 661.836 456.236, 588.780 548.821, 488.500 607.724 C 467.194 620.239, 420.825 645, 418.695 645 C 417.216 645, 419.673 608.756, 421.553 602.832 C 422.335 600.370, 423.498 600.193, 446.302 599.048 C 471.150 597.801, 470.002 598.724, 466.055 583.167 C 461.173 563.920, 460.979 564.315, 478.486 557.960 C 610.741 509.951, 674.863 366.463, 621.629 237.646 C 598.393 181.420, 529.902 119.704, 470.500 101.468 C 453.923 96.379, 453.151 96.050, 452.427 93.771 C 452.076 92.664, 453.259 84.451, 455.056 75.521 C 458.967 56.086, 459.278 57.164, 448.152 51.576 C 432.526 43.728, 411.049 30.140, 398.803 20.352 C 390.615 13.808, 390.737 13.809, 382.877 20.123 M 329.723 164.487 C 173.505 220.082, 164.045 413.813, 313.840 489.732 C 335.376 500.647, 334.660 501.050, 339.953 475 C 353.029 410.637, 357.976 316.778, 352.180 243 C 345.822 162.064, 344.963 159.063, 329.723 164.487 M 438.720 164.138 C 433.355 172.743, 426.995 257.397, 427.010 320 C 427.027 389.999, 430.285 424.681, 441.616 475.500 C 447.333 501.142, 445.886 499.900, 461.500 492.567 C 615.210 420.383, 612.274 229.328, 456.490 166.524 C 444.255 161.592, 440.613 161.102, 438.720 164.138" fill="currentColor" fillRule="evenodd" stroke="none" />
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
