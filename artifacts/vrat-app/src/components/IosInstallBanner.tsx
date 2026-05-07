import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "vrat_ios_install_dismissed_v1";

function isIosDevice(): boolean {
  const ua = window.navigator.userAgent;
  const isIPhoneOrIPad = /iPhone|iPad|iPod/.test(ua);
  // iPadOS 13+ reports as Mac — detect via touch points.
  const isIPadOs =
    ua.includes("Macintosh") &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;
  return isIPhoneOrIPad || isIPadOs;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function IosInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (!isIosDevice()) return;
    if (isStandalone()) return;

    const t = setTimeout(() => setShow(true), 10_000);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl shadow-xl"
      style={{ backgroundColor: "#E8621A", color: "#FFFFFF" }}
      role="banner"
      aria-live="polite"
      data-testid="ios-install-banner"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <p className="flex-1 text-sm leading-snug">
          <span className="font-semibold">Install VRAT on your iPhone</span> — tap
          the Share button{" "}
          <span aria-hidden="true" className="font-semibold">⬆️</span> then{" "}
          <span className="font-semibold">"Add to Home Screen"</span>.
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install banner"
          className="flex-shrink-0 rounded-full p-1 hover:bg-white/15 active:bg-white/25 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
