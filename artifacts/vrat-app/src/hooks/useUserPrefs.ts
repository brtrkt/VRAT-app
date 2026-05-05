export const ONBOARDING_KEY = "vrat_onboarding_done";
export const HAS_SEEN_ONBOARDING_KEY = "hasSeenOnboarding";
export const DEVICE_ID_KEY = "vrat_device_id_v1";

const SETTINGS_API_BASE: string =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "";

function generateDeviceId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `dev_${crypto.randomUUID()}`;
    }
  } catch {}
  return `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getUserId(): string {
  try {
    const email = localStorage.getItem("vrat_user_email_v1");
    if (email && email.trim()) return `email:${email.trim().toLowerCase()}`;
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return `device:${id}`;
  } catch {
    return `device:${generateDeviceId()}`;
  }
}

export async function pushSettingsToServer(): Promise<void> {
  try {
    const userId = getUserId();
    const body = {
      user_id: userId,
      tradition: localStorage.getItem("vrat_tradition"),
      observed: JSON.parse(localStorage.getItem("vrat_observed") || "[]"),
      city: localStorage.getItem("vrat_city"),
      location: localStorage.getItem("vrat_location"),
      region: localStorage.getItem("vrat_region"),
    };
    await fetch(`${SETTINGS_API_BASE}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // best-effort; localStorage write already succeeded
  }
}

export async function pullSettingsFromServer(): Promise<boolean> {
  try {
    const userId = getUserId();
    const res = await fetch(
      `${SETTINGS_API_BASE}/api/settings?user_id=${encodeURIComponent(userId)}`,
      { method: "GET" }
    );
    if (!res.ok) return false;
    const data = await res.json();
    if (!data || data.found !== true) return false;
    if (typeof data.tradition === "string" && data.tradition) {
      localStorage.setItem("vrat_tradition", data.tradition);
    }
    if (Array.isArray(data.observed)) {
      localStorage.setItem("vrat_observed", JSON.stringify(data.observed));
    }
    if (typeof data.city === "string") {
      localStorage.setItem("vrat_city", data.city);
    }
    if (typeof data.location === "string" && data.location) {
      localStorage.setItem("vrat_location", data.location);
    }
    if (typeof data.region === "string" && data.region) {
      localStorage.setItem("vrat_region", data.region);
    }
    // If server has settings, treat onboarding as completed too — the user
    // configured the app on a previous device/session and we just rehydrated.
    if (
      (typeof data.tradition === "string" && data.tradition) ||
      (Array.isArray(data.observed) && data.observed.length > 0)
    ) {
      localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "true");
      localStorage.setItem(ONBOARDING_KEY, "1");
    }
    return true;
  } catch {
    return false;
  }
}
export function hasSeenOnboarding(): boolean {
  try {
    return (
      localStorage.getItem(HAS_SEEN_ONBOARDING_KEY) === "true" ||
      !!localStorage.getItem(ONBOARDING_KEY)
    );
  } catch {
    return false;
  }
}
export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "true");
    localStorage.setItem(ONBOARDING_KEY, "1");
  } catch {}
}
export const TRIAL_START_KEY = "vrat_trial_start";
export const TRIAL_DAYS = 30;
export const TRADITION_KEY = "vrat_tradition";
export const OBSERVED_KEY = "vrat_observed";
export const CITY_KEY = "vrat_city";
export const LOCATION_KEY = "vrat_location";
export const REGION_KEY = "vrat_region";
export const USER_EMAIL_KEY = "vrat_user_email_v1";
export const SUBSCRIBED_KEY = "vrat_subscribed_v1";

export function getUserEmail(): string {
  return localStorage.getItem(USER_EMAIL_KEY) || "";
}

export function setUserEmail(email: string): void {
  localStorage.setItem(USER_EMAIL_KEY, email.trim().toLowerCase());
}

export function isSubscribed(): boolean {
  return !!localStorage.getItem(SUBSCRIBED_KEY);
}

export function setSubscribed(): void {
  localStorage.setItem(SUBSCRIBED_KEY, "1");
}

export type Tradition = "Hindu" | "Jain" | "Sikh" | "Swaminarayan" | "ISKCON" | "Lingayat" | "PushtiMarg" | "Warkari" | "Ramanandi" | "SriVaishnava" | "Shakta" | "ShaivaSiddhanta" | "Bishnoi" | "AryaSamaj" | "Both";
export type UserLocation = "india" | "uk" | "usa" | "australia";

export type UserRegion = string;

export interface RegionInfo {
  id: UserRegion;
  label: string;
  shortLabel: string;
}

export const INDIA_REGION_OPTIONS: RegionInfo[] = [
  { id: "all",                label: "All Regions",                      shortLabel: "All" },
  { id: "north-india",        label: "North India",                      shortLabel: "North India" },
  { id: "maharashtra",        label: "Maharashtra",                      shortLabel: "Maharashtra" },
  { id: "gujarat",            label: "Gujarat",                          shortLabel: "Gujarat" },
  { id: "bengal-odisha",      label: "Bengal / Odisha",                  shortLabel: "Bengal" },
  { id: "south-india",        label: "Tamil Nadu / Andhra / Karnataka",  shortLabel: "South India" },
  { id: "punjab-haryana",     label: "Punjab / Haryana",                 shortLabel: "Punjab" },
  { id: "rajasthan-up-bihar", label: "Rajasthan / UP / Bihar",           shortLabel: "Raj · UP · Bihar" },
];

export const USA_REGION_OPTIONS: RegionInfo[] = [
  { id: "all",      label: "All States",            shortLabel: "All" },
  { id: "us-al",    label: "Alabama",               shortLabel: "AL" },
  { id: "us-ak",    label: "Alaska",                shortLabel: "AK" },
  { id: "us-az",    label: "Arizona",               shortLabel: "AZ" },
  { id: "us-ar",    label: "Arkansas",              shortLabel: "AR" },
  { id: "us-ca",    label: "California",            shortLabel: "CA" },
  { id: "us-co",    label: "Colorado",              shortLabel: "CO" },
  { id: "us-ct",    label: "Connecticut",           shortLabel: "CT" },
  { id: "us-de",    label: "Delaware",              shortLabel: "DE" },
  { id: "us-dc",    label: "District of Columbia",  shortLabel: "DC" },
  { id: "us-fl",    label: "Florida",               shortLabel: "FL" },
  { id: "us-ga",    label: "Georgia",               shortLabel: "GA" },
  { id: "us-hi",    label: "Hawaii",                shortLabel: "HI" },
  { id: "us-id",    label: "Idaho",                 shortLabel: "ID" },
  { id: "us-il",    label: "Illinois",              shortLabel: "IL" },
  { id: "us-in",    label: "Indiana",               shortLabel: "IN" },
  { id: "us-ia",    label: "Iowa",                  shortLabel: "IA" },
  { id: "us-ks",    label: "Kansas",                shortLabel: "KS" },
  { id: "us-ky",    label: "Kentucky",              shortLabel: "KY" },
  { id: "us-la",    label: "Louisiana",             shortLabel: "LA" },
  { id: "us-me",    label: "Maine",                 shortLabel: "ME" },
  { id: "us-md",    label: "Maryland",              shortLabel: "MD" },
  { id: "us-ma",    label: "Massachusetts",         shortLabel: "MA" },
  { id: "us-mi",    label: "Michigan",              shortLabel: "MI" },
  { id: "us-mn",    label: "Minnesota",             shortLabel: "MN" },
  { id: "us-ms",    label: "Mississippi",           shortLabel: "MS" },
  { id: "us-mo",    label: "Missouri",              shortLabel: "MO" },
  { id: "us-mt",    label: "Montana",               shortLabel: "MT" },
  { id: "us-ne",    label: "Nebraska",              shortLabel: "NE" },
  { id: "us-nv",    label: "Nevada",                shortLabel: "NV" },
  { id: "us-nh",    label: "New Hampshire",         shortLabel: "NH" },
  { id: "us-nj",    label: "New Jersey",            shortLabel: "NJ" },
  { id: "us-nm",    label: "New Mexico",            shortLabel: "NM" },
  { id: "us-ny",    label: "New York",              shortLabel: "NY" },
  { id: "us-nc",    label: "North Carolina",        shortLabel: "NC" },
  { id: "us-nd",    label: "North Dakota",          shortLabel: "ND" },
  { id: "us-oh",    label: "Ohio",                  shortLabel: "OH" },
  { id: "us-ok",    label: "Oklahoma",              shortLabel: "OK" },
  { id: "us-or",    label: "Oregon",                shortLabel: "OR" },
  { id: "us-pa",    label: "Pennsylvania",          shortLabel: "PA" },
  { id: "us-ri",    label: "Rhode Island",          shortLabel: "RI" },
  { id: "us-sc",    label: "South Carolina",        shortLabel: "SC" },
  { id: "us-sd",    label: "South Dakota",          shortLabel: "SD" },
  { id: "us-tn",    label: "Tennessee",             shortLabel: "TN" },
  { id: "us-tx",    label: "Texas",                 shortLabel: "TX" },
  { id: "us-ut",    label: "Utah",                  shortLabel: "UT" },
  { id: "us-vt",    label: "Vermont",               shortLabel: "VT" },
  { id: "us-va",    label: "Virginia",              shortLabel: "VA" },
  { id: "us-wa",    label: "Washington",            shortLabel: "WA" },
  { id: "us-wv",    label: "West Virginia",         shortLabel: "WV" },
  { id: "us-wi",    label: "Wisconsin",             shortLabel: "WI" },
  { id: "us-wy",    label: "Wyoming",               shortLabel: "WY" },
  { id: "ca-ab",    label: "Alberta (Canada)",                shortLabel: "AB" },
  { id: "ca-bc",    label: "British Columbia (Canada)",       shortLabel: "BC" },
  { id: "ca-mb",    label: "Manitoba (Canada)",               shortLabel: "MB" },
  { id: "ca-nb",    label: "New Brunswick (Canada)",          shortLabel: "NB" },
  { id: "ca-nl",    label: "Newfoundland & Labrador (Canada)", shortLabel: "NL" },
  { id: "ca-ns",    label: "Nova Scotia (Canada)",            shortLabel: "NS" },
  { id: "ca-nt",    label: "Northwest Territories (Canada)",  shortLabel: "NT" },
  { id: "ca-nu",    label: "Nunavut (Canada)",                shortLabel: "NU" },
  { id: "ca-on",    label: "Ontario (Canada)",                shortLabel: "ON" },
  { id: "ca-pe",    label: "Prince Edward Island (Canada)",   shortLabel: "PE" },
  { id: "ca-qc",    label: "Quebec (Canada)",                 shortLabel: "QC" },
  { id: "ca-sk",    label: "Saskatchewan (Canada)",           shortLabel: "SK" },
  { id: "ca-yt",    label: "Yukon (Canada)",                  shortLabel: "YT" },
];

export const UK_REGION_OPTIONS: RegionInfo[] = [
  { id: "all",         label: "All UK",            shortLabel: "All" },
  { id: "uk-england",  label: "England",           shortLabel: "England" },
  { id: "uk-scotland", label: "Scotland",          shortLabel: "Scotland" },
  { id: "uk-wales",    label: "Wales",             shortLabel: "Wales" },
  { id: "uk-ni",       label: "Northern Ireland",  shortLabel: "NI" },
];

export const AUSTRALIA_REGION_OPTIONS: RegionInfo[] = [
  { id: "all",     label: "All Australia",                  shortLabel: "All" },
  { id: "au-nsw",  label: "New South Wales",                shortLabel: "NSW" },
  { id: "au-vic",  label: "Victoria",                       shortLabel: "VIC" },
  { id: "au-qld",  label: "Queensland",                     shortLabel: "QLD" },
  { id: "au-wa",   label: "Western Australia",              shortLabel: "WA" },
  { id: "au-sa",   label: "South Australia",                shortLabel: "SA" },
  { id: "au-tas",  label: "Tasmania",                       shortLabel: "TAS" },
  { id: "au-act",  label: "Australian Capital Territory",   shortLabel: "ACT" },
  { id: "au-nt",   label: "Northern Territory",             shortLabel: "NT" },
];

// Backward-compat export — defaults to India.
// Prefer getRegionOptionsForLocation(loc) in new code so the list adapts to the user's country.
export const REGION_OPTIONS = INDIA_REGION_OPTIONS;

export function getRegionOptionsForLocation(loc: UserLocation): RegionInfo[] {
  switch (loc) {
    case "india":     return INDIA_REGION_OPTIONS;
    case "usa":       return USA_REGION_OPTIONS;
    case "uk":        return UK_REGION_OPTIONS;
    case "australia": return AUSTRALIA_REGION_OPTIONS;
  }
}

export function getRegionScreenCopy(loc: UserLocation): { title: string; body: string } {
  switch (loc) {
    case "india":
      return {
        title: "Which region do you follow?",
        body:  "We'll add regional vrats for your area alongside the pan-Indian calendar.",
      };
    case "usa":
      return {
        title: "Which state are you in?",
        body:  "We'll use this to refine sunrise and moonrise calculations for your area.",
      };
    case "uk":
      return {
        title: "Which part of the UK?",
        body:  "We'll use this to refine sunrise and moonrise calculations for your area.",
      };
    case "australia":
      return {
        title: "Which state are you in?",
        body:  "We'll use this to refine sunrise and moonrise calculations for your area.",
      };
  }
}

export function isValidRegionForLocation(regionId: UserRegion, loc: UserLocation): boolean {
  return getRegionOptionsForLocation(loc).some((r) => r.id === regionId);
}

export const DEFAULT_OBSERVED = ["ekadashi", "purnima", "pradosh"];

export interface LocationInfo {
  id: UserLocation;
  label: string;
  flag: string;
  timezone: string;
  note: string;
}

export const LOCATION_OPTIONS: LocationInfo[] = [
  {
    id: "india",
    label: "India",
    flag: "🇮🇳",
    timezone: "IST (UTC+5:30)",
    note: "Dates shown directly per Drik Panchang IST.",
  },
  {
    id: "uk",
    label: "United Kingdom",
    flag: "🇬🇧",
    timezone: "GMT / BST",
    note: "Dates per Drik Panchang IST. Some dates may fall a day earlier — verify with your local pandit.",
  },
  {
    id: "usa",
    label: "USA / Canada",
    flag: "🇺🇸",
    timezone: "Eastern Time (ET)",
    note: "Dates per Drik Panchang IST. Some tithis begin the previous evening ET — verify with your local pandit.",
  },
  {
    id: "australia",
    label: "Australia",
    flag: "🇦🇺",
    timezone: "AEST (UTC+10)",
    note: "Dates per Drik Panchang IST. Some dates may fall a day later — verify with your local pandit.",
  },
];

export function getUserRegion(): UserRegion {
  return (localStorage.getItem(REGION_KEY) as UserRegion) || "all";
}

export function setUserRegion(region: UserRegion): void {
  localStorage.setItem(REGION_KEY, region);
}

export function getRegionInfo(id?: UserRegion, loc?: UserLocation): RegionInfo {
  const regionId = id ?? getUserRegion();
  const location = loc ?? getUserLocation();
  const opts = getRegionOptionsForLocation(location);
  return opts.find((r) => r.id === regionId) ?? opts[0];
}

export function getUserTradition(): Tradition {
  const stored = localStorage.getItem(TRADITION_KEY) as Tradition | null;
  if (!stored || stored === "Both") return "Hindu";
  return stored;
}

export function getObservedVrats(): string[] {
  try {
    const raw = localStorage.getItem(OBSERVED_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_OBSERVED;
  } catch {
    return DEFAULT_OBSERVED;
  }
}

export function getUserCity(): string {
  return localStorage.getItem(CITY_KEY) || "";
}

export function getUserLocation(): UserLocation {
  return (localStorage.getItem(LOCATION_KEY) as UserLocation) || "india";
}

export function setUserLocation(loc: UserLocation): void {
  localStorage.setItem(LOCATION_KEY, loc);
}

export function getLocationInfo(id?: UserLocation): LocationInfo {
  return LOCATION_OPTIONS.find((l) => l.id === (id ?? getUserLocation())) ?? LOCATION_OPTIONS[0];
}

export function initTrial(): void {
  if (!localStorage.getItem(TRIAL_START_KEY)) {
    localStorage.setItem(TRIAL_START_KEY, String(Date.now()));
  }
}

export function getTrialStartMs(): number {
  const raw = localStorage.getItem(TRIAL_START_KEY);
  return raw ? parseInt(raw, 10) : Date.now();
}

export function getDaysRemaining(): number {
  const elapsed = Date.now() - getTrialStartMs();
  const elapsedDays = elapsed / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays));
}

export function isTrialExpired(): boolean {
  return getDaysRemaining() === 0;
}

export function isVratObserved(vratId: string, observed: string[]): boolean {
  return observed.some(
    (pattern) =>
      vratId === pattern ||
      vratId.startsWith(pattern + "-") ||
      (pattern.includes("-") && vratId.startsWith(pattern))
  );
}
