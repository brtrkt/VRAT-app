import { useState, useEffect } from "react";
import { X } from "lucide-react";

const VISIT_KEY   = "vrat_visit_count_v1";
const DISMISS_KEY = "vrat_install_dismissed_v1";

function getVisitCount(): number {
  return parseInt(localStorage.getItem(VISIT_KEY) || "0", 10);
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const count = getVisitCount() + 1;
    localStorage.setItem(VISIT_KEY, String(count));

    // Show prompt 30 seconds after the page loads, on every visit until
    // the user installs or dismisses.
    const showTimer = setTimeout(() => setShow(true), 30000);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }

    function onAppInstalled() {
      setInstalled(true);
      setShow(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  function handleInstall() {
    if (deferredPrompt) {
      (deferredPrompt as Event & { prompt: () => void }).prompt();
      setShow(false);
    } else {
      window.location.href = "/how-to-install";
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  if (!show || installed) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl shadow-xl overflow-hidden"
      style={{ border: "1.5px solid rgba(255,111,0,0.35)" }}
      data-testid="pwa-install-prompt"
      role="banner"
      aria-live="polite"
    >
      <div
        className="px-4 py-3.5 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)" }}
      >
        <span className="text-2xl flex-shrink-0" aria-hidden="true">🪔</span>
        <p className="flex-1 text-sm leading-snug" style={{ color: "#78350F" }}>
          <span className="font-semibold">Add V<span style={{ color: "#FF9933" }}>RA</span>T to your home screen</span>
          {" "}for the best experience
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #FF6F00 0%, #E65100 100%)" }}
            data-testid="pwa-install-btn"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(120,53,15,0.10)" }}
            aria-label="Dismiss"
            data-testid="pwa-dismiss-btn"
          >
            <X size={14} style={{ color: "#78350F" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
