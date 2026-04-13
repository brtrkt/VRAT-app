import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import WhatToEat from "@/pages/WhatToEat";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Paywall from "@/pages/Paywall";
import VratHistory from "@/pages/VratHistory";
import Onboarding from "@/components/Onboarding";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import HowToInstall from "@/pages/HowToInstall";
import { ONBOARDING_KEY, initTrial, isTrialExpired } from "@/hooks/useUserPrefs";

const queryClient = new QueryClient();

const DISCLAIMER_KEY = "vrat_disclaimer_accepted";

function DisclaimerPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISCLAIMER_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function accept() {
    localStorage.setItem(DISCLAIMER_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden"
        style={{ border: "1px solid rgba(224,123,42,0.25)" }}
      >
        <div
          className="px-6 pt-7 pb-4 text-center"
          style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl" aria-hidden="true">🪔</span>
            <span className="font-serif text-xl font-bold text-foreground">Welcome to VRAT</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            This app shares traditional Hindu and Jain fasting knowledge passed down through
            generations. All content is for{" "}
            <span className="font-semibold">spiritual and educational guidance only</span> — not
            medical advice.
          </p>
          <div className="rounded-xl bg-amber-50 border border-amber-200/70 px-4 py-3 mb-5">
            <p className="text-[11px] text-amber-900/75 leading-relaxed">
              By continuing you agree to our{" "}
              <span className="font-semibold">Terms of Use</span>. If you have any health
              conditions, please consult your doctor before fasting.
            </p>
          </div>
          <button
            onClick={accept}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm tracking-wide transition-opacity active:opacity-80"
            style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
          >
            I understand — let me begin
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    {
      path: "/",
      label: "Home",
      icon: (active: boolean) => (
        <svg
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      path: "/eat",
      label: "What to Eat",
      icon: (active: boolean) => (
        <svg
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M18 8h1a4 4 0 010 8h-1" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
    },
    {
      path: "/calendar",
      label: "Calendar",
      icon: (active: boolean) => (
        <svg
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <rect x="8" y="14" width="3" height="3" rx="0.5" fill={active ? "currentColor" : "none"} />
        </svg>
      ),
    },
    {
      path: "/settings",
      label: "Settings",
      icon: (active: boolean) => (
        <svg
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-card-border"
      data-testid="bottom-nav"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`nav-${tab.label.toLowerCase().replace(/\s/g, "-")}`}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              {tab.icon(active)}
              <span
                className={`text-xs font-medium transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="relative" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/eat" component={WhatToEat} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/settings" component={Settings} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/vrat-history" component={VratHistory} />
        <Route path="/how-to-install" component={HowToInstall} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  const [onboardingDone, setOnboardingDone] = useState(
    () => !!localStorage.getItem(ONBOARDING_KEY)
  );
  const [trialExpired, setTrialExpired] = useState(false);

  useEffect(() => {
    initTrial();
    setTrialExpired(isTrialExpired());
  }, []);

  function handleOnboardingComplete() {
    initTrial();
    setOnboardingDone(true);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {!onboardingDone ? (
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : trialExpired ? (
            <Paywall />
          ) : (
            <DisclaimerPopup />
          )}
          {!trialExpired && <Router />}
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
