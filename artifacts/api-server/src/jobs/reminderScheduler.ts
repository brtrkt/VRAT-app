import { logger } from "../lib/logger";
import { runDailyReminders } from "./reminders";

const TARGET_HOUR_CST = 20;
const TARGET_MIN_CST = 0;
const CHECK_INTERVAL_MS = 60_000;

let started = false;
let interval: NodeJS.Timeout | null = null;
let lastFiredOnDate: string | null = null;

function chicagoNowParts(): { date: string; hour: number; minute: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === t)!.value;
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  let hour = parseInt(get("hour"), 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(get("minute"), 10);
  return { date, hour, minute };
}

export function startReminderScheduler(): void {
  if (started) return;
  started = true;

  if (!process.env.DATABASE_URL) {
    logger.warn("Reminder scheduler not started: DATABASE_URL is unset");
    return;
  }

  interval = setInterval(() => {
    const { date, hour, minute } = chicagoNowParts();
    if (lastFiredOnDate === date) return;
    if (hour < TARGET_HOUR_CST) return;
    if (hour === TARGET_HOUR_CST && minute < TARGET_MIN_CST) return;

    lastFiredOnDate = date;
    logger.info({ chicagoDate: date, hour, minute }, "Triggering daily vrat reminders");
    void runDailyReminders().catch((err) => {
      logger.warn({ err: (err as Error).message }, "Daily reminders run failed");
    });
  }, CHECK_INTERVAL_MS);

  if (interval.unref) interval.unref();

  logger.info(
    { targetHourCst: TARGET_HOUR_CST, targetMinCst: TARGET_MIN_CST },
    "Reminder scheduler started"
  );
}

export function stopReminderScheduler(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  started = false;
  lastFiredOnDate = null;
}
