import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  TRADITION_KEY,
  OBSERVED_KEY,
  CITY_KEY,
  LOCATION_KEY,
  REGION_KEY,
  ONBOARDING_KEY,
  LOCATION_OPTIONS,
  getRegionOptionsForLocation,
  getRegionScreenCopy,
  isValidRegionForLocation,
  type Tradition,
  type UserLocation,
  type UserRegion,
  getUserTradition,
  getObservedVrats,
  getUserCity,
  getUserLocation,
  getUserRegion,
  isVratObserved,
  isSubscribed,
  getDaysRemaining,
  isTrialExpired,
  getUserEmail,
  setUserEmail,
  setSubscribed,
} from "@/hooks/useUserPrefs";
import { detectCurrency, type Currency } from "@/utils/currencyDetect";
import PageFooter from "@/components/PageFooter";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const PRICES = {
  monthly:  { usd: "$2.99/month",  inr: "₹249/month"  },
  annual:   { usd: "$19.99/year",  inr: "₹1,699/year" },
  lifetime: { usd: "$49.99",       inr: "₹3,999"      },
} as const;

const VRAT_OPTIONS: { id: string; label: string; subtitle: string; tradition: "Hindu" | "Jain" | "Sikh" | "Swaminarayan" | "ISKCON" | "Lingayat" | "PushtiMarg" }[] = [
  { id: "ekadashi",                   label: "Ekadashi",                       subtitle: "24 days a year",                           tradition: "Hindu" },
  { id: "purnima",                    label: "Purnima",                        subtitle: "Full moon · 12 days a year",               tradition: "Hindu" },
  { id: "pradosh",                    label: "Pradosh / Pradosham",            subtitle: "For Lord Shiva · 24 days a year",          tradition: "Hindu" },
  { id: "amavasya",                   label: "Amavasya",                       subtitle: "New moon · 12 days a year",                tradition: "Hindu" },
  { id: "sankashti",                  label: "Sankashti Chaturthi",            subtitle: "For Lord Ganesha · 12 days a year",        tradition: "Hindu" },
  { id: "maha-shivratri",             label: "Maha Shivratri",                 subtitle: "The great night of Shiva",                 tradition: "Hindu" },
  { id: "navratri",                   label: "Navratri",                       subtitle: "Nine nights of Durga · twice a year",      tradition: "Hindu" },
  { id: "janmashtami",                label: "Janmashtami",                    subtitle: "Birth of Lord Krishna",                    tradition: "Hindu" },
  { id: "ram-navami",                 label: "Ram Navami",                     subtitle: "Birth of Lord Ram",                        tradition: "Hindu" },
  { id: "hanuman-jayanti",            label: "Hanuman Jayanti",                subtitle: "Hanuman ji",                               tradition: "Hindu" },
  { id: "ganesh-chaturthi",           label: "Ganesh Chaturthi",               subtitle: "Birth of Lord Ganesha",                   tradition: "Hindu" },
  { id: "diwali",                     label: "Deepawali / Lakshmi Puja",          subtitle: "Festival of lights",                      tradition: "Hindu" },
  { id: "karva-chauth",               label: "Karva Chauth",                   subtitle: "For a husband's long life",               tradition: "Hindu" },
  { id: "hartalika-teej",             label: "Hartalika Teej",                 subtitle: "For Lord Shiva and Parvati",              tradition: "Hindu" },
  { id: "hariyali-teej",              label: "Hariyali Teej",                  subtitle: "Monsoon celebration of Parvati",          tradition: "Hindu" },
  { id: "vat-savitri",                label: "Vat Savitri",                    subtitle: "For a husband's longevity",               tradition: "Hindu" },
  { id: "ahoi-ashtami",               label: "Ahoi Ashtami",                   subtitle: "For children's wellbeing",                tradition: "Hindu" },
  { id: "chhath-puja",                label: "Chhath Puja",                    subtitle: "For the Sun God · 36-hour strict fast",   tradition: "Hindu" },
  { id: "akshaya-tritiya",            label: "Akshaya Tritiya",                subtitle: "The auspicious third",                    tradition: "Hindu" },
  { id: "mahavir-jayanti",            label: "Mahavir Jayanti",                subtitle: "Birth of Lord Mahavira",                  tradition: "Jain"  },
  { id: "paryushana",                 label: "Paryushana",                     subtitle: "Eight days of reflection and fasting",    tradition: "Jain"  },
  { id: "samvatsari",                 label: "Samvatsari Pratikraman",         subtitle: "Annual day of forgiveness",               tradition: "Jain"  },
  { id: "navpad-oli",                 label: "Navpad Oli",                     subtitle: "Nine days of austerity · twice a year",   tradition: "Jain"  },
  { id: "das-lakshana",               label: "Das Lakshana Parva",             subtitle: "Ten days of dharma",                      tradition: "Jain"  },
  { id: "mahavira-nirvana",           label: "Mahavira Nirvana",               subtitle: "Jain Deepawali · day of liberation",         tradition: "Jain"  },
  { id: "guru-gobind-singh-gurpurab",    label: "Guru Gobind Singh Ji Gurpurab",      subtitle: "Poh 7 (Jan 6) · 10th Guru's birth anniversary",         tradition: "Sikh" },
  { id: "maghi",                         label: "Maghi",                              subtitle: "Magh 1 (Jan 14) · Battle of Muktsar · 40 Muktas",        tradition: "Sikh" },
  { id: "guru-har-rai-jayanti",          label: "Guru Har Rai Ji Jayanti",            subtitle: "Magh 18 (Jan 31) · 7th Guru's birth anniversary",         tradition: "Sikh" },
  { id: "guru-ravidas-jayanti",          label: "Guru Ravidas Ji Jayanti",            subtitle: "Phagan 1 (Feb 12) · Sant poet-saint's birth anniversary",  tradition: "Sikh" },
  { id: "hola-mohalla",                  label: "Hola Mohalla",                       subtitle: "Phagan 19 (Mar 4) · Khalsa martial arts festival",         tradition: "Sikh" },
  { id: "baisakhi-sikh",                 label: "Baisakhi (Vaisakhi)",                subtitle: "Vaisakh 1 (Apr 14) · Khalsa Sajna Divas",                 tradition: "Sikh" },
  { id: "guru-arjan-dev-shaheedi",       label: "Guru Arjan Dev Ji Shaheedi Divas",   subtitle: "Harh 2 (Jun 16) · 5th Guru's Martyrdom Day",              tradition: "Sikh" },
  { id: "guru-hargobind-jayanti",        label: "Guru Hargobind Ji Gurpurab",         subtitle: "Harh 5 (Jun 19) · 6th Guru's birth anniversary",          tradition: "Sikh" },
  { id: "guru-har-krishan-jayanti",      label: "Guru Har Krishan Ji Gurpurab",       subtitle: "Sawan 8 (Jul 23) · 8th Guru's birth anniversary",         tradition: "Sikh" },
  { id: "sangrand",                      label: "Sangrand",                           subtitle: "1st of each Nanakshahi month · 12 per year",              tradition: "Sikh" },
  { id: "guru-ram-das-jayanti",          label: "Guru Ram Das Ji Gurpurab",           subtitle: "Assu 24 (Oct 9) · 4th Guru's birth anniversary",          tradition: "Sikh" },
  { id: "guru-granth-sahib-gurgaddi",   label: "Guru Granth Sahib Ji Gurgaddi Divas",subtitle: "Katik 5 (Oct 20) · Eternal Guru enthroned",              tradition: "Sikh" },
  { id: "bandi-chhor-divas",            label: "Bandi Chhor Divas",                  subtitle: "Katik 5 (Oct 20) · Day of Liberation · coincides with Deepawali", tradition: "Sikh" },
  { id: "guru-nanak-gurpurab",          label: "Guru Nanak Dev Ji Gurpurab",          subtitle: "Katik 21 (Nov 5) · Founder of Sikhism's birth anniversary", tradition: "Sikh" },
  { id: "guru-tegh-bahadur-shaheedi",   label: "Guru Tegh Bahadur Ji Shaheedi Divas",subtitle: "Maghar 10 (Nov 24) · 9th Guru's Martyrdom Day",           tradition: "Sikh" },
  { id: "swaminarayan-jayanti",       label: "Swaminarayan Jayanti",  subtitle: "Chaitra Shukla Navami · Lord Swaminarayan's birth",    tradition: "Swaminarayan" },
  { id: "fuldol-swaminarayan",        label: "Fuldol",                subtitle: "Phalgun Purnima · flower festival before Holi",        tradition: "Swaminarayan" },
  { id: "annakut-swaminarayan",       label: "Annakut",               subtitle: "Day after Deepawali · Swaminarayan New Year offering",    tradition: "Swaminarayan" },
  { id: "ekadashi-swaminarayan-jan-1",label: "Swaminarayan Ekadashi", subtitle: "Ekadashi with strict satvik fast · no onion, garlic", tradition: "Swaminarayan" },
  { id: "iskcon-ekadashi",       label: "Ekadashi (Vaishnava)",  subtitle: "No grains · 24 days a year · Parana next morning",         tradition: "ISKCON" },
  { id: "janmashtami-iskcon",    label: "Janmashtami",           subtitle: "Midnight fast · Lord Krishna's appearance day",             tradition: "ISKCON" },
  { id: "gaura-purnima",         label: "Gaura Purnima",         subtitle: "Sri Chaitanya Mahaprabhu's appearance day",                 tradition: "ISKCON" },
  { id: "radhashtami",           label: "Radhashtami",           subtitle: "Srimati Radharani's appearance day",                        tradition: "ISKCON" },
  { id: "kartik-damodara",       label: "Kartik Damodara Month", subtitle: "Month-long vow · daily ghee lamp offering",                 tradition: "ISKCON" },
  { id: "nityananda-trayodashi",    label: "Nityananda Trayodashi",  subtitle: "Sri Nityananda Prabhu's appearance day",               tradition: "ISKCON" },
  { id: "narasimha-chaturdashi",    label: "Narasimha Chaturdashi",  subtitle: "Vaishakha Shukla 14 · fast until sunset · Nrsimha puja", tradition: "ISKCON" },
  { id: "ugadi-lingayat",            label: "Ugadi (Kannada New Year)", subtitle: "Feb 15 · Ishtalinga puja · Ugadi Pachadi",               tradition: "Lingayat" },
  { id: "maha-shivaratri-lingayat", label: "Maha Shivaratri",  subtitle: "Nirjala fast · all-night Ishtalinga worship",                tradition: "Lingayat" },
  { id: "somavara-lingayat",        label: "Shravana Somavara",   subtitle: "Mondays of Shravana · fruit fast · Ishtalinga puja to Lord Shiva",  tradition: "Lingayat" },
  { id: "basava-jayanti",           label: "Basava Jayanti",    subtitle: "Apr 20 · Basavanna's birth anniversary",                    tradition: "Lingayat" },
  { id: "varalakshmi-vratam-lingayat", label: "Varamahalakshmi Vratam", subtitle: "Aug 28 · Goddess Varamahalakshmi · women's vrat",          tradition: "Lingayat" },
  { id: "lakshmi-puja-lingayat",       label: "Lakshmi Puja — Deepawali", subtitle: "Nov 8 · Festival of lights · Ishtalinga puja first",  tradition: "Lingayat" },
  { id: "ekadashi-pushti-marg",    label: "Ekadashi",                subtitle: "Grain-free bhog · 26 days a year",                    tradition: "PushtiMarg" },
  { id: "janmashtami-pushti-marg", label: "Janmashtami",             subtitle: "Most sacred · Chappan Bhog at midnight",              tradition: "PushtiMarg" },
  { id: "annakut-pushti-marg",     label: "Annakut & Govardhan Puja",subtitle: "Day after Deepawali · Chappan Bhog seva",                tradition: "PushtiMarg" },
  { id: "phoolon-wali-holi",       label: "Phoolon wali Holi",       subtitle: "Falgun Purnima · flower Holi at Shrinathji's haveli", tradition: "PushtiMarg" },
  { id: "hindola-utsav",           label: "Hindola Utsav",           subtitle: "Ashadha Shukla 2 · 40-day swing festival",            tradition: "PushtiMarg" },
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

type Section = "main" | "location" | "region" | "tradition" | "vrats" | "subscribe";
type Plan = "monthly" | "annual" | "lifetime";

export default function Settings() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [section, setSection] = useState<Section>("main");
  const [saved, setSaved] = useState(false);

  const [tradition, setTradition] = useState<Tradition>(getUserTradition);
  const [observed, setObserved] = useState<string[]>(getObservedVrats);
  const [city, setCity] = useState(getUserCity);
  const [location, setLocationState] = useState<UserLocation>(getUserLocation);
  const [region, setRegion] = useState<UserRegion>(getUserRegion);

  // When the user changes country in Settings, reset region to "All" if the
  // currently-selected region doesn't exist in the new country's list.
  // Prevents an Indian region (e.g. maharashtra) being kept after switching to USA.
  const setLocation = useCallback((next: UserLocation) => {
    setLocationState(next);
    setRegion((prev) => (isValidRegionForLocation(prev, next) ? prev : "all"));
  }, []);

  const subscribed = isSubscribed();
  const daysRemaining = getDaysRemaining();
  const trialOver = isTrialExpired();

  const [subEmail, setSubEmail] = useState(getUserEmail);
  const [subPlan, setSubPlan] = useState<Plan>("annual");
  const [subCurrency, setSubCurrency] = useState<Currency | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelInfo, setCancelInfo] = useState<{
    cancel_at_period_end: boolean;
    current_period_end: string | null;
  } | null>(null);

  useEffect(() => {
    if (section === "subscribe") {
      detectCurrency().then(setSubCurrency);
    }
  }, [section]);

  useEffect(() => {
    if (!subscribed) {
      setCancelInfo(null);
      return;
    }
    const email = getUserEmail();
    if (!email) return;

    let cancelled = false;
    fetch(`${API_BASE}/api/stripe/verify?email=${encodeURIComponent(email)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || !data.subscribed) return;
        setCancelInfo({
          cancel_at_period_end: !!data.cancel_at_period_end,
          current_period_end: data.current_period_end ?? null,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [subscribed]);

  function formatPeriodEnd(iso: string | null): string {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

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

  async function handleSubscribe() {
    const email = subEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubError("Please enter a valid email address.");
      return;
    }
    if (!subCurrency) return;
    setUserEmail(email);
    setSubLoading(true);
    setSubError("");
    try {
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: subPlan, currency: subCurrency }),
      });
      const data = await res.json();
      if (!res.ok) { setSubError(data.error || "Something went wrong. Please try again."); return; }
      if (data.url) window.location.href = data.url;
    } catch {
      setSubError("Could not connect. Please check your internet and try again.");
    } finally {
      setSubLoading(false);
    }
  }

  async function handleRestore() {
    const email = subEmail.trim();
    if (!email) { setSubError("Enter your email to restore access."); return; }
    setRestoring(true);
    setSubError("");
    try {
      const res = await fetch(`${API_BASE}/api/stripe/verify?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.subscribed) { setSubscribed(); window.location.reload(); }
      else { setSubError("No active subscription found for this email."); }
    } catch {
      setSubError("Could not verify. Please check your internet connection.");
    } finally {
      setRestoring(false);
    }
  }

  async function handlePortal() {
    const email = getUserEmail();
    if (!email) return;
    setPortalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setPortalLoading(false);
    }
  }

  function toggleVrat(id: string) {
    setObserved((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  const currentLocationInfo = LOCATION_OPTIONS.find((l) => l.id === location) ?? LOCATION_OPTIONS[0];
  const regionOptions = getRegionOptionsForLocation(location);
  const regionCopy = getRegionScreenCopy(location);
  const currentRegionInfo = regionOptions.find((r) => r.id === region) ?? regionOptions[0];
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

          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">{regionCopy.title}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {regionCopy.body}
          </p>

          <div className="space-y-2">
            {regionOptions.map((opt) => {
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
      { value: "Hindu",        label: "Hindu",        subtitle: "Ekadashi, Navratri, Karva Chauth and more" },
      { value: "Jain",         label: "Jain",         subtitle: "Paryushana, Navpad Oli, Samvatsari and more" },
      { value: "Sikh",         label: "Sikh",         subtitle: "Gurpurabs, Baisakhi, Sangrand and more" },
      { value: "Swaminarayan", label: "Swaminarayan", subtitle: "Jayanti, Fuldol, Annakut and strict Ekadashi" },
      { value: "ISKCON",       label: "ISKCON / Vaishnava", subtitle: "Ekadashi (no grains), Gaura Purnima, Janmashtami, Kartik" },
      { value: "Lingayat",     label: "Lingayat / Veerashaiva", subtitle: "Maha Shivaratri, Shravana Somavara, Basava Jayanti" },
      { value: "PushtiMarg",   label: "Pushti Marg / Vallabha Sampraday", subtitle: "Ekadashi (seva-based), Janmashtami, Annakut, Hindola Utsav" },
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
                  onClick={() => {
                    setTradition(opt.value);
                    localStorage.setItem(TRADITION_KEY, opt.value);
                    setSection("main");
                  }}
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
        </div>
      </div>
    );
  }

  if (section === "vrats") {
    const hinduVrats        = VRAT_OPTIONS.filter((v) => v.tradition === "Hindu");
    const jainVrats         = VRAT_OPTIONS.filter((v) => v.tradition === "Jain");
    const sikhVrats         = VRAT_OPTIONS.filter((v) => v.tradition === "Sikh");
    const swaminarayanVrats = VRAT_OPTIONS.filter((v) => v.tradition === "Swaminarayan");
    const iskconVrats       = VRAT_OPTIONS.filter((v) => v.tradition === "ISKCON");
    const lingayatVrats     = VRAT_OPTIONS.filter((v) => v.tradition === "Lingayat");
    const pushtiMargVrats   = VRAT_OPTIONS.filter((v) => v.tradition === "PushtiMarg");
    const showHindu        = tradition === "Hindu";
    const showJain         = tradition === "Jain";
    const showSikh         = tradition === "Sikh";
    const showSwaminarayan = tradition === "Swaminarayan";
    const showISKCON       = tradition === "ISKCON";
    const showLingayat     = tradition === "Lingayat";
    const showPushtiMarg   = tradition === "PushtiMarg";
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
          {showSikh && (
            <>
              {sikhVrats.map((opt) => (
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
          {showSwaminarayan && (
            <>
              {swaminarayanVrats.map((opt) => (
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
          {showISKCON && (
            <>
              {iskconVrats.map((opt) => (
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
          {showLingayat && (
            <>
              {lingayatVrats.map((opt) => (
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
          {showPushtiMarg && (
            <>
              {pushtiMargVrats.map((opt) => (
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

  if (section === "subscribe") {
    const c = subCurrency ?? "usd";
    const plans: { id: Plan; label: string; price: string; badge?: string; sub?: string }[] = [
      { id: "annual",   label: "Yearly",   price: PRICES.annual[c],   badge: "BEST VALUE", sub: "Save 44%" },
      { id: "monthly",  label: "Monthly",  price: PRICES.monthly[c]  },
      { id: "lifetime", label: "Lifetime", price: PRICES.lifetime[c], sub: "Pay once, yours forever" },
    ];

    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button onClick={() => setSection("main")} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>

          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Choose your plan</h2>
          <p className="text-sm text-muted-foreground mb-6">Unlock VRAT Premium — full access to all 140+ vrats, fasting guides, mantras, and katha.</p>

          <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-3">Your email</p>
          <div className="vrat-card p-4 mb-6">
            <input
              type="email"
              value={subEmail}
              onChange={(e) => { setSubEmail(e.target.value); setSubError(""); }}
              placeholder="your@email.com"
              className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              inputMode="email"
              autoComplete="email"
              data-testid="sub-email-input"
            />
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-3">Plan</p>
          {subCurrency === null ? (
            <div className="space-y-3 mb-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-full rounded-2xl animate-pulse" style={{ background: "#F5E6D3", height: 68 }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {plans.map((plan) => {
                const active = subPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSubPlan(plan.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.99]"
                    style={{
                      border: `2px solid ${active ? ACCENT : "#E5E7EB"}`,
                      background: active ? `${ACCENT}12` : "white",
                    }}
                    data-testid={`settings-plan-${plan.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{plan.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {plan.badge && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: active ? ACCENT : "#F3F4F6", color: active ? "white" : "#6B7280" }}>
                          {plan.badge}
                        </span>
                      )}
                      {plan.sub && (
                        <span className="text-xs" style={{ color: active ? "#9A3412" : "#9CA3AF" }}>{plan.sub}</span>
                      )}
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                        <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {subError && (
            <p className="text-xs text-red-600 text-center mb-3 px-2">{subError}</p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={subLoading || subCurrency === null}
            className="w-full py-4 rounded-2xl font-bold text-base text-white tracking-wide transition-opacity active:opacity-80 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}
            data-testid="settings-subscribe-btn"
          >
            {subLoading ? "Redirecting to payment…" : subPlan === "lifetime" ? "Get Lifetime Access" : "Subscribe Now"}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            {subPlan === "lifetime" ? "Pay once · Full access forever · No renewal" : "Full access · Cancel anytime · No ads"}
          </p>

          <button
            onClick={handleRestore}
            disabled={restoring}
            className="w-full text-center text-xs mt-5 py-2 transition-opacity active:opacity-50 disabled:opacity-40 text-muted-foreground"
            data-testid="settings-restore-btn"
          >
            {restoring ? "Checking…" : "Already subscribed? Restore access"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
      <div className="max-w-md mx-auto px-5 pt-6 pb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-1">{t("nav.settings")}</h1>
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
              {tradition === "Hindu" ? "Hindu vrats only" : tradition === "Jain" ? "Jain vrats only" : tradition === "Sikh" ? "Sikh Gurpurabs and observances" : tradition === "Swaminarayan" ? "Swaminarayan vrats and festivals" : tradition === "ISKCON" ? "ISKCON / Vaishnava observances" : tradition === "Lingayat" ? "Lingayat / Veerashaiva observances" : tradition === "PushtiMarg" ? "Pushti Marg utsavs and Ekadashi" : `${tradition} observances`}
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

        <SectionHeader title="Subscription" />
        {subscribed ? (
          <>
            <div className="vrat-card p-4 flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: cancelInfo?.cancel_at_period_end ? "#FEF3C7" : "#DCFCE7" }}
              >
                {cancelInfo?.cancel_at_period_end ? (
                  <svg viewBox="0 0 20 20" fill="#B45309" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="#16A34A" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Premium Active</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cancelInfo?.cancel_at_period_end && cancelInfo.current_period_end
                    ? `Cancels on ${formatPeriodEnd(cancelInfo.current_period_end)}`
                    : "Full access to all vrats and features"}
                </p>
              </div>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-opacity active:opacity-70 disabled:opacity-50"
                style={{ background: "#F3F4F6", color: "#374151" }}
                data-testid="settings-manage-btn"
              >
                {portalLoading ? "…" : "Manage"}
              </button>
            </div>
            {cancelInfo?.cancel_at_period_end && cancelInfo.current_period_end && (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your subscription is scheduled to end on{" "}
                  <span className="font-semibold">{formatPeriodEnd(cancelInfo.current_period_end)}</span>.
                  You'll keep full access until then. Tap{" "}
                  <span className="font-semibold">Manage</span> to resume your subscription.
                </p>
              </div>
            )}
          </>
        ) : trialOver ? (
          <button
            onClick={() => setSection("subscribe")}
            className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
            data-testid="settings-subscribe-card"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FEE2E2" }}>
              <svg viewBox="0 0 20 20" fill="#DC2626" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Free trial ended</p>
              <p className="text-xs text-muted-foreground mt-0.5">Subscribe to continue your vrat journey</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        ) : (
          <button
            onClick={() => setSection("subscribe")}
            className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
            data-testid="settings-subscribe-card"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FEF3C7" }}>
              <svg viewBox="0 0 20 20" fill="#D97706" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Free Trial — {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining</p>
              <p className="text-xs text-muted-foreground mt-0.5">Subscribe now to keep full access</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        )}

        <SectionHeader title="Install" />
        <a
          href="/how-to-install"
          className="w-full vrat-card p-4 flex items-center gap-3 text-left active:opacity-70 transition-opacity"
          data-testid="settings-how-to-install"
        >
          <span className="text-xl flex-shrink-0" aria-hidden="true">🪔</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">How to install VRAT</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen in seconds</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>

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
