import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  TRADITION_KEY,
  OBSERVED_KEY,
  CITY_KEY,
  LOCATION_KEY,
  REGION_KEY,
  ONBOARDING_KEY,
  LOCATION_OPTIONS,
  REGION_OPTIONS,
  type Tradition,
  type UserLocation,
  type UserRegion,
  getUserTradition,
  getObservedVrats,
  getUserCity,
  getUserLocation,
  getUserRegion,
  isVratObserved,
} from "@/hooks/useUserPrefs";
import PageFooter from "@/components/PageFooter";

const VRAT_OPTIONS: { id: string; label: string; subtitle: string; tradition: "Hindu" | "Jain" }[] = [
  { id: "ekadashi",         label: "Ekadashi",              subtitle: "24 days a year",                       tradition: "Hindu" },
  { id: "purnima",          label: "Purnima",               subtitle: "Full moon · 12 days a year",           tradition: "Hindu" },
  { id: "pradosh",          label: "Pradosh / Pradosham",   subtitle: "For Lord Shiva · 24 days a year",      tradition: "Hindu" },
  { id: "amavasya",         label: "Amavasya",              subtitle: "New moon · 12 days a year",            tradition: "Hindu" },
  { id: "sankashti",        label: "Sankashti Chaturthi",   subtitle: "For Lord Ganesha · 12 days a year",    tradition: "Hindu" },
  { id: "maha-shivratri",   label: "Maha Shivratri",        subtitle: "The great night of Shiva",             tradition: "Hindu" },
  { id: "navratri",         label: "Navratri",              subtitle: "Nine nights of Durga · twice a year",  tradition: "Hindu" },
  { id: "janmashtami",      label: "Janmashtami",           subtitle: "Birth of Lord Krishna",                tradition: "Hindu" },
  { id: "ram-navami",       label: "Ram Navami",            subtitle: "Birth of Lord Ram",                    tradition: "Hindu" },
  { id: "hanuman-jayanti",  label: "Hanuman Jayanti",       subtitle: "Hanuman ji",                           tradition: "Hindu" },
  { id: "ganesh-chaturthi", label: "Ganesh Chaturthi",      subtitle: "Birth of Lord Ganesha",                tradition: "Hindu" },
  { id: "diwali",           label: "Diwali / Lakshmi Puja", subtitle: "Festival of lights",                   tradition: "Hindu" },
  { id: "karva-chauth",     label: "Karva Chauth",          subtitle: "For a husband's long life",            tradition: "Hindu" },
  { id: "hartalika-teej",   label: "Hartalika Teej",        subtitle: "For Lord Shiva and Parvati",           tradition: "Hindu" },
  { id: "hariyali-teej",    label: "Hariyali Teej",         subtitle: "Monsoon celebration of Parvati",       tradition: "Hindu" },
  { id: "vat-savitri",      label: "Vat Savitri",           subtitle: "For a husband's longevity",            tradition: "Hindu" },
  { id: "ahoi-ashtami",     label: "Ahoi Ashtami",          subtitle: "For children's wellbeing",             tradition: "Hindu" },
  { id: "chhath-puja",      label: "Chhath Puja",           subtitle: "For the Sun God · 36-hour strict fast",tradition: "Hindu" },
  { id: "akshaya-tritiya",  label: "Akshaya Tritiya",       subtitle: "The auspicious third",                 tradition: "Hindu" },
  { id: "mahavir-jayanti",  label: "Mahavir Jayanti",       subtitle: "Birth of Lord Mahavira",               tradition: "Jain"  },
  { id: "paryushana",       label: "Paryushana",            subtitle: "Eight days of reflection and fasting", tradition: "Jain"  },
  { id: "samvatsari",       label: "Samvatsari Pratikraman",subtitle: "Annual day of forgiveness",            tradition: "Jain"  },
  { id: "navpad-oli",       label: "Navpad Oli",            subtitle: "Nine days of austerity · twice a year",tradition: "Jain"  },
  { id: "das-lakshana",     label: "Das Lakshana Parva",    subtitle: "Ten days of dharma",                   tradition: "Jain"  },
  { id: "mahavira-nirvana", label: "Mahavira Nirvana",      subtitle: "Jain Diwali · day of liberation",     tradition: "Jain"  },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors"
      style={{ backgroundColor: on ? "#E07B2A" : "#D1D5DB" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-3 mt-6 first:mt-0">
      {title}
    </p>
  );
}

type Section = "main" | "location" | "region" | "tradition" | "vrats";

export default function Settings() {
  const [, navigate] = useLocation();
  const [section, setSection] = useState<Section>("main");
  const [saved, setSaved] = useState(false);

  const [tradition, setTradition] = useState<Tradition>(getUserTradition);
  const [observed, setObserved] = useState<string[]>(getObservedVrats);
  const [city, setCity] = useState(getUserCity);
  const [location, setLocation] = useState<UserLocation>(getUserLocation);
  const [region, setRegion] = useState<UserRegion>(getUserRegion);

  const save = useCallback(() => {
    localStorage.setItem(TRADITION_KEY, tradition);
    localStorage.setItem(OBSERVED_KEY, JSON.stringify(observed));
    localStorage.setItem(CITY_KEY, city.trim());
    localStorage.setItem(LOCATION_KEY, location);
    localStorage.setItem(REGION_KEY, region);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (section !== "main") setSection("main");
  }, [tradition, observed, city, location, region, section]);

  function toggleVrat(id: string) {
    setObserved((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  const currentLocationInfo = LOCATION_OPTIONS.find((l) => l.id === location) ?? LOCATION_OPTIONS[0];
  const currentRegionInfo = REGION_OPTIONS.find((r) => r.id === region) ?? REGION_OPTIONS[0];
  const ACCENT = "#E07B2A";

  if (section === "location") {
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button
            onClick={() => setSection("main")}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>

          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Change location</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Panchang dates follow IST. We'll show a regional note in the calendar for your area.
          </p>

          <div className="space-y-3">
            {LOCATION_OPTIONS.map((opt) => {
              const selected = location === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setLocation(opt.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
                  style={{
                    border: `2px solid ${selected ? ACCENT : "#E5E7EB"}`,
                    background: selected ? `${ACCENT}12` : "white",
                  }}
                  data-testid={`settings-location-${opt.id}`}
                >
                  <span className="text-3xl flex-shrink-0">{opt.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.timezone}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                      <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {location !== getUserLocation() && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-800 leading-relaxed">{currentLocationInfo.note}</p>
            </div>
          )}

          <button
            onClick={save}
            className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}
          >
            Save location
          </button>
        </div>
      </div>
    );
  }

  if (section === "region") {
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button
            onClick={() => setSection("main")}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>

          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">My region</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Regional vrats specific to your area will appear alongside the pan-Indian calendar.
          </p>

          <div className="space-y-2">
            {REGION_OPTIONS.map((opt) => {
              const selected = region === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setRegion(opt.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{
                    border: `2px solid ${selected ? ACCENT : "#E5E7EB"}`,
                    background: selected ? `${ACCENT}12` : "white",
                  }}
                  data-testid={`settings-region-${opt.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-foreground">{opt.label}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                      <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={save}
            className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}
          >
            Save region
          </button>
        </div>
      </div>
    );
  }

  if (section === "tradition") {
    const OPTIONS: { value: Tradition; label: string; subtitle: string }[] = [
      { value: "Hindu", label: "Hindu", subtitle: "Ekadashi, Navratri, Karva Chauth and more" },
      { value: "Jain", label: "Jain", subtitle: "Paryushana, Navpad Oli, Samvatsari and more" },
      { value: "Both", label: "Both", subtitle: "Hindu and Jain observances together" },
    ];
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button onClick={() => setSection("main")} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Tradition</h2>
          <p className="text-sm text-muted-foreground mb-6">Choose the tradition that matches your practice.</p>
          <div className="space-y-3">
            {OPTIONS.map((opt) => {
              const selected = tradition === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTradition(opt.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{ border: `2px solid ${selected ? ACCENT : "#E5E7EB"}`, background: selected ? `${ACCENT}12` : "white" }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-base text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.subtitle}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                      <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={save} className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80" style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}>
            Save
          </button>
        </div>
      </div>
    );
  }

  if (section === "vrats") {
    const hinduVrats = VRAT_OPTIONS.filter((v) => v.tradition === "Hindu");
    const jainVrats = VRAT_OPTIONS.filter((v) => v.tradition === "Jain");
    const showHindu = tradition === "Hindu" || tradition === "Both";
    const showJain = tradition === "Jain" || tradition === "Both";
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button onClick={() => setSection("main")} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">My vrats</h2>
          <p className="text-sm text-muted-foreground mb-4">Your starred vrats appear highlighted in the calendar.</p>

          {showHindu && (
            <>
              {tradition === "Both" && <SectionHeader title="Hindu" />}
              {hinduVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showJain && (
            <>
              {tradition === "Both" && <SectionHeader title="Jain" />}
              {jainVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}

          <button onClick={save} className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80" style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}>
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
      <div className="max-w-md mx-auto px-5 pt-6 pb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">Personalise your VRAT experience.</p>

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600 flex-shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800 font-medium">Saved successfully</p>
          </div>
        )}

        <SectionHeader title="Location" />
        <button
          onClick={() => setSection("location")}
          className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
          data-testid="settings-change-location"
        >
          <span className="text-2xl">{currentLocationInfo.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{currentLocationInfo.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{currentLocationInfo.timezone}</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          {currentLocationInfo.note}
        </p>

        <SectionHeader title="Region" />
        <button
          onClick={() => setSection("region")}
          className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
          data-testid="settings-change-region"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{currentRegionInfo.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentRegionInfo.id === "all" ? "Showing all regional vrats" : "Regional vrats for your area are shown"}
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <SectionHeader title="Tradition" />
        <button
          onClick={() => setSection("tradition")}
          className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
          data-testid="settings-change-tradition"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{tradition}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tradition === "Hindu" ? "Hindu vrats only" : tradition === "Jain" ? "Jain vrats only" : "Hindu and Jain vrats"}
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <SectionHeader title="My vrats" />
        <button
          onClick={() => setSection("vrats")}
          className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
          data-testid="settings-change-vrats"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{observed.length} vrat{observed.length !== 1 ? "s" : ""} selected</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tap to add or remove</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <SectionHeader title="City" />
        <div className="vrat-card p-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Delhi, London..."
            className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">Used for sunrise and moonrise calculations.</p>

        <button
          onClick={save}
          className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}
          data-testid="settings-save"
        >
          Save changes
        </button>

        <div className="mt-8 pt-6 border-t border-stone-200">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">About</p>
          <div className="space-y-3">
            <a href="/privacy" className="flex items-center justify-between vrat-card p-4 text-sm text-foreground active:opacity-70">
              Privacy Policy
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground"><path d="M9 18l6-6-6-6" /></svg>
            </a>
            <a href="/terms" className="flex items-center justify-between vrat-card p-4 text-sm text-foreground active:opacity-70">
              Terms of Use
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground"><path d="M9 18l6-6-6-6" /></svg>
            </a>
          </div>
        </div>

        <PageFooter />
      </div>
    </div>
  );
}
