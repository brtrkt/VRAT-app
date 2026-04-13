import type { Vrat } from "@/data/vrats";

export const HISTORY_KEY = "vrat_observations_v2";
const BADGES_SEEN_KEY = "vrat_badges_seen_v1";

export type VratObservations = Record<string, string[]>;

export interface StreakItem {
  vrat: Vrat;
  streak: number;
  unit: string;
  totalCount: number;
  isNirjala: boolean;
}

export interface BadgeResult {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  earned: boolean;
  newlyEarned: boolean;
}

export interface HistoryEntry {
  vratId: string;
  vratName: string;
  date: string;
  isNirjala: boolean;
}

export interface VratSummary {
  vrat: Vrat;
  count: number;
}

// ─── Core storage ─────────────────────────────────────────────────────────────

export function getObservations(): VratObservations {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveObservations(obs: VratObservations): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(obs));
}

export function addObservation(vratId: string, dateStr: string): void {
  const obs = getObservations();
  if (!obs[vratId]) obs[vratId] = [];
  if (!obs[vratId].includes(dateStr)) {
    obs[vratId].push(dateStr);
    obs[vratId].sort();
  }
  saveObservations(obs);
}

export function removeObservation(vratId: string, dateStr: string): void {
  const obs = getObservations();
  if (!obs[vratId]) return;
  obs[vratId] = obs[vratId].filter((d) => d !== dateStr);
  if (obs[vratId].length === 0) delete obs[vratId];
  saveObservations(obs);
}

export function isObservedDate(vratId: string, dateStr: string): boolean {
  const obs = getObservations();
  return (obs[vratId] || []).includes(dateStr);
}

// ─── Frequency detection ──────────────────────────────────────────────────────

function getFrequency(vrat: Vrat): "weekly" | "monthly" | "annual" {
  const dates2026 = vrat.dates.filter((d) => d.startsWith("2026")).sort();
  if (dates2026.length <= 2) return "annual";

  const months = new Set(dates2026.map((d) => d.slice(0, 7)));
  if (months.size <= 4) return "annual";

  let totalGap = 0;
  for (let i = 1; i < dates2026.length; i++) {
    const gap =
      (new Date(dates2026[i]).getTime() - new Date(dates2026[i - 1]).getTime()) /
      86400000;
    totalGap += gap;
  }
  const avgGap = totalGap / (dates2026.length - 1);
  return avgGap < 10 ? "weekly" : "monthly";
}

// ─── Streak computation ───────────────────────────────────────────────────────

export function computeStreak(
  vrat: Vrat,
  obs: VratObservations
): { streak: number; unit: string } {
  const observed = new Set(obs[vrat.id] || []);
  const todayStr = new Date().toISOString().split("T")[0];
  const freq = getFrequency(vrat);

  if (freq === "annual") {
    const yearMap: Record<string, string[]> = {};
    for (const d of vrat.dates) {
      if (d > todayStr) continue;
      const yr = d.slice(0, 4);
      if (!yearMap[yr]) yearMap[yr] = [];
      yearMap[yr].push(d);
    }
    const years = Object.keys(yearMap).sort().reverse();
    let streak = 0;
    for (const yr of years) {
      const anyObserved = yearMap[yr].some((d) => observed.has(d));
      if (anyObserved) streak++;
      else break;
    }
    const unit = streak === 1 ? "year" : "years in a row";
    return { streak, unit };
  } else {
    const pastDates = vrat.dates.filter((d) => d <= todayStr).sort().reverse();
    let streak = 0;
    for (const d of pastDates) {
      if (observed.has(d)) streak++;
      else break;
    }
    const unit =
      freq === "weekly"
        ? streak === 1
          ? "week"
          : "consecutive weeks"
        : streak === 1
        ? "time observed"
        : "consecutive observed";
    return { streak, unit };
  }
}

// ─── Top streaks ──────────────────────────────────────────────────────────────

export function getTopStreaks(vrats: Vrat[], n: number): StreakItem[] {
  const obs = getObservations();
  const items: StreakItem[] = vrats
    .filter((v) => (obs[v.id] || []).length > 0)
    .map((v) => {
      const { streak, unit } = computeStreak(v, obs);
      return {
        vrat: v,
        streak,
        unit,
        totalCount: (obs[v.id] || []).length,
        isNirjala: !!v.nirjala,
      };
    })
    .filter((item) => item.streak > 0)
    .sort((a, b) => b.streak - a.streak || b.totalCount - a.totalCount);
  return items.slice(0, n);
}

// ─── Full history ─────────────────────────────────────────────────────────────

export function getFullHistory(vrats: Vrat[]): HistoryEntry[] {
  const obs = getObservations();
  const vratMap = new Map(vrats.map((v) => [v.id, v]));
  const entries: HistoryEntry[] = [];
  for (const [vratId, dates] of Object.entries(obs)) {
    const vrat = vratMap.get(vratId);
    if (!vrat) continue;
    for (const date of dates) {
      entries.push({
        vratId,
        vratName: vrat.name,
        date,
        isNirjala: !!vrat.nirjala,
      });
    }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function getVratSummaries(vrats: Vrat[]): VratSummary[] {
  const obs = getObservations();
  return vrats
    .filter((v) => (obs[v.id] || []).length > 0)
    .map((v) => ({ vrat: v, count: (obs[v.id] || []).length }))
    .sort((a, b) => b.count - a.count);
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function getSeenBadges(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(BADGES_SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function markBadgesSeen(badgeIds: string[]): void {
  const seen = getSeenBadges();
  badgeIds.forEach((id) => seen.add(id));
  localStorage.setItem(BADGES_SEEN_KEY, JSON.stringify([...seen]));
}

export function checkBadges(vrats: Vrat[]): BadgeResult[] {
  const obs = getObservations();
  const seen = getSeenBadges();

  const totalAny = Object.values(obs).reduce((s, arr) => s + arr.length, 0);
  const shubhEarned = totalAny >= 1;

  const ekadashiIds = vrats.filter((v) => v.id.includes("ekadashi")).map((v) => v.id);
  const ekadashiTotal = ekadashiIds.reduce((s, id) => s + (obs[id] || []).length, 0);
  const ekadashiEarned = ekadashiTotal >= 10;

  const navratriVrats = vrats.filter((v) => v.id.includes("navratri"));
  let navdurgaEarned = false;
  outer: for (const nv of navratriVrats) {
    const yearMap: Record<string, string[]> = {};
    for (const d of nv.dates) {
      const yr = d.slice(0, 4);
      if (!yearMap[yr]) yearMap[yr] = [];
      yearMap[yr].push(d);
    }
    for (const datesInYear of Object.values(yearMap)) {
      if (datesInYear.length >= 9) {
        const allObserved = datesInYear.every((d) => (obs[nv.id] || []).includes(d));
        if (allObserved) {
          navdurgaEarned = true;
          break outer;
        }
      }
    }
  }

  return [
    {
      id: "shubh-aarambh",
      name: "Shubh Aarambh",
      subtitle: "Auspicious Beginning",
      description:
        "You observed your very first vrat. The journey of a thousand prayers begins with one.",
      earned: shubhEarned,
      newlyEarned: shubhEarned && !seen.has("shubh-aarambh"),
    },
    {
      id: "ekadashi-sevak",
      name: "Ekadashi Sevak",
      subtitle: "Devoted to Ekadashi",
      description: `You have observed Ekadashi ${ekadashiTotal} times. The waters of devotion run deep.`,
      earned: ekadashiEarned,
      newlyEarned: ekadashiEarned && !seen.has("ekadashi-sevak"),
    },
    {
      id: "navdurga-bhakt",
      name: "Navdurga Bhakt",
      subtitle: "Devotee of Navdurga",
      description:
        "You completed all 9 days of Navratri. Jai Mata Di — all nine forms of Durga honour your devotion.",
      earned: navdurgaEarned,
      newlyEarned: navdurgaEarned && !seen.has("navdurga-bhakt"),
    },
  ];
}
