export const ONBOARDING_KEY = "vrat_onboarding_done";
export const TRADITION_KEY = "vrat_tradition";
export const OBSERVED_KEY = "vrat_observed";
export const CITY_KEY = "vrat_city";

export type Tradition = "Hindu" | "Jain" | "Both";

export const DEFAULT_OBSERVED = ["ekadashi", "purnima", "pradosh"];

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

export function isVratObserved(vratId: string, observed: string[]): boolean {
  return observed.some(
    (pattern) =>
      vratId === pattern ||
      vratId.startsWith(pattern + "-") ||
      (pattern.includes("-") && vratId.startsWith(pattern))
  );
}
