import { Pool } from "pg";
import { configurePoolSearchPath } from "../lib/dbUrl";
import { logger } from "../lib/logger";
import { sendResendEmail } from "../lib/email";
import {
  getVratsForDate,
  filterVratsByTradition,
  type Vrat,
} from "../../../vrat-app/src/data/vrats";

const DISCLAIMER_TRADITIONS = new Set(["ISKCON", "Swaminarayan"]);

interface ReminderUserRow {
  email: string;
  tradition: string | null;
}

let remindersPool: Pool | null = null;
function getRemindersPool(): Pool {
  if (!remindersPool) {
    remindersPool = configurePoolSearchPath(
      new Pool({ connectionString: process.env.DATABASE_URL })
    );
  }
  return remindersPool;
}

/**
 * Compute the YYYY-MM-DD date string for "tomorrow" in America/Chicago
 * (US Central). The cron fires at 8 PM CST, so this consistently targets
 * the next calendar day in Central Time regardless of DST.
 */
export function tomorrowInChicago(now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

async function fetchReminderUsers(): Promise<ReminderUserRow[]> {
  const db = getRemindersPool();
  const result = await db.query<ReminderUserRow>(
    `SELECT u.email AS email, s.tradition AS tradition
       FROM public.vrat_users u
       JOIN public.vrat_user_settings s ON s.user_id = u.email
      WHERE u.email IS NOT NULL
        AND s.tradition IS NOT NULL`
  );
  return result.rows;
}

function buildEmail(vrat: Vrat, tradition: string): { subject: string; text: string } {
  const subject = `Your fast is tomorrow — ${vrat.name}`;
  const lines: string[] = [
    `Tomorrow is ${vrat.name}, observed for ${vrat.deity || "your tradition"}.`,
    vrat.description ? vrat.description.split(/(?<=\.)\s/)[0] : "",
    `Suggested meal: ${vrat.mealIdea || "Consult the app for ideas."}`,
  ].filter(Boolean);

  if (DISCLAIMER_TRADITIONS.has(tradition)) {
    lines.push(
      "Note: Your tradition may observe Ekadashi on a different day — please verify with your sampradaya calendar."
    );
  }

  lines.push("— The VRAT app");
  return { subject, text: lines.join("\n\n") };
}

export interface ReminderRunResult {
  targetDate: string;
  usersConsidered: number;
  emailsSent: number;
  emailsFailed: number;
  perTradition: Record<string, number>;
}

export async function runDailyReminders(): Promise<ReminderRunResult> {
  const targetDate = tomorrowInChicago();
  const usersAll = await fetchReminderUsers();
  const dayVrats = getVratsForDate(targetDate);

  const result: ReminderRunResult = {
    targetDate,
    usersConsidered: usersAll.length,
    emailsSent: 0,
    emailsFailed: 0,
    perTradition: {},
  };

  if (dayVrats.length === 0) {
    logger.info({ targetDate }, "No vrats fall on target date; skipping reminders");
    return result;
  }

  for (const user of usersAll) {
    const tradition = user.tradition!;
    const matches = filterVratsByTradition(dayVrats, tradition);
    if (matches.length === 0) continue;
    const primary = matches[0];
    const { subject, text } = buildEmail(primary, tradition);
    const ok = await sendResendEmail({ to: user.email, subject, text });
    if (ok) {
      result.emailsSent += 1;
      result.perTradition[tradition] = (result.perTradition[tradition] ?? 0) + 1;
    } else {
      result.emailsFailed += 1;
    }
  }

  logger.info(result, "Daily reminders run complete");
  return result;
}
