export const ONBOARDING_KEY = "vrat_onboarding_done";
export const TRADITION_KEY = "vrat_tradition";
export const OBSERVED_KEY = "vrat_observed";
export const CITY_KEY = "vrat_city";
export const LOCATION_KEY = "vrat_location";

export type Tradition = "Hindu" | "Jain" | "Both";
export type UserLocation = "india" | "uk" | "usa" | "australia";

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

export function getUserTradition(): Tradition {
  return (localStorage.getItem(TRADITION_KEY) as Tradition) || "Both";
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

export function isVratObserved(vratId: string, observed: string[]): boolean {
  return observed.some(
    (pattern) =>
      vratId === pattern ||
      vratId.startsWith(pattern + "-") ||
      (pattern.includes("-") && vratId.startsWith(pattern))
  );
}
