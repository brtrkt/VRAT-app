import { logger } from "../lib/logger";
import { runBackup, findMostRecentBackupAgeMs } from "./backup";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let started = false;
let interval: NodeJS.Timeout | null = null;

export async function startBackupScheduler(): Promise<void> {
  if (started) return;
  started = true;

  if (!process.env.DATABASE_URL) {
    logger.warn("Backup scheduler not started: DATABASE_URL is unset");
    return;
  }

  // Run once on startup if no backup exists in the last ~23h. This way a
  // restart loop won't spam backups, but a fresh deploy still gets one.
  try {
    const ageMs = await findMostRecentBackupAgeMs();
    if (ageMs === null || ageMs > ONE_DAY_MS - 60 * 60 * 1000) {
      logger.info(
        { lastBackupAgeMs: ageMs },
        "Running startup backup (no recent backup found within last 23h)",
      );
      // Fire and forget — failures are logged inside runBackup.
      void runBackup();
    } else {
      logger.info(
        { lastBackupAgeMs: ageMs },
        "Skipping startup backup; recent backup exists",
      );
    }
  } catch (err) {
    logger.warn(
      { err: (err as Error).message },
      "Could not check for recent backups on startup",
    );
  }

  interval = setInterval(() => {
    void runBackup();
  }, ONE_DAY_MS);

  // Don't keep the event loop alive solely for the backup timer — the HTTP
  // server already does that, and we want the process to be able to exit
  // cleanly during shutdown.
  if (interval.unref) interval.unref();

  logger.info({ intervalMs: ONE_DAY_MS }, "Backup scheduler started (24h interval)");
}

export function stopBackupScheduler(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  started = false;
}
