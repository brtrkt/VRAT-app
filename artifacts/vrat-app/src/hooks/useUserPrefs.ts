export const ONBOARDING_KEY = "vrat_onboarding_done";
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

export type Tradition = "Hindu" | "Jain" | "Sikh" | "Swaminarayan" | "ISKCON" | "Lingayat" | "PushtiMarg" | "Both";
export type UserLocation = "india" | "uk" | "usa" | "australia";
export type UserRegion =
  | "all"
  | "north-india"
  | "maharashtra"
  | "gujarat"
  | "bengal-odisha"
  | "south-india"
  | "punjab-haryana"
  | "rajasthan-up-bihar";

export interface RegionInfo {
  id: UserRegion;
  label: string;
  shortLabel: string;
}

export const REGION_OPTIONS: RegionInfo[] = [
  { id: "all",                label: "All Regions",                      shortLabel: "All" },
  { id: "north-india",        label: "North India",                      shortLabel: "North India" },
  { id: "maharashtra",        label: "Maharashtra",                      shortLabel: "Maharashtra" },
  { id: "gujarat",            label: "Gujarat",                          shortLabel: "Gujarat" },
  { id: "bengal-odisha",      label: "Bengal / Odisha",                  shortLabel: "Bengal" },
  { id: "south-india",        label: "Tamil Nadu / Andhra / Karnataka",  shortLabel: "South India" },
  { id: "punjab-haryana",     label: "Punjab / Haryana",                 shortLabel: "Punjab" },
  { id: "rajasthan-up-bihar", label: "Rajasthan / UP / Bihar",           shortLabel: "Raj · UP · Bihar" },
];

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

export function getRegionInfo(id?: UserRegion): RegionInfo {
  return REGION_OPTIONS.find((r) => r.id === (id ?? getUserRegion())) ?? REGION_OPTIONS[0];
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
