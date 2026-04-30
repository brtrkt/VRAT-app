import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { logger } from "../lib/logger";

const BACKUP_FILENAME_PREFIX = "vrat-backup-";
const BACKUP_FILENAME_SUFFIX = ".sql.gz";
const RETENTION_DAYS = 7;

function backupsDir(): string {
  return process.env.BACKUPS_DIR
    ? path.resolve(process.env.BACKUPS_DIR)
    : path.resolve(process.cwd(), "backups");
}

function timestampForFilename(now: Date): string {
  return now.toISOString().replace(/[:.]/g, "-").replace(/-\d{3}Z$/, "Z");
}

function buildFilename(now: Date): string {
  return `${BACKUP_FILENAME_PREFIX}${timestampForFilename(now)}${BACKUP_FILENAME_SUFFIX}`;
}

async function runPgDumpToGzipFile(databaseUrl: string, outFile: string): Promise<void> {
  await mkdir(path.dirname(outFile), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const dump = spawn("pg_dump", [databaseUrl], { stdio: ["ignore", "pipe", "pipe"] });
    const gzip = spawn("gzip", ["-c"], { stdio: ["pipe", "pipe", "pipe"] });
    const out = createWriteStream(outFile);

    let dumpStderr = "";
    let gzipStderr = "";
    let settled = false;

    function fail(err: Error) {
      if (settled) return;
      settled = true;
      try { dump.kill("SIGTERM"); } catch { /* ignore */ }
      try { gzip.kill("SIGTERM"); } catch { /* ignore */ }
      reject(err);
    }

    dump.stderr.on("data", (b) => { dumpStderr += b.toString(); });
    gzip.stderr.on("data", (b) => { gzipStderr += b.toString(); });

    dump.stdout.pipe(gzip.stdin);
    gzip.stdout.pipe(out);

    dump.on("error", (err) => fail(new Error(`pg_dump spawn failed: ${err.message}`)));
    gzip.on("error", (err) => fail(new Error(`gzip spawn failed: ${err.message}`)));
    out.on("error", (err) => fail(new Error(`write failed: ${err.message}`)));

    dump.on("close", (code) => {
      if (code !== 0) {
        fail(new Error(`pg_dump exited with code ${code}: ${dumpStderr.trim()}`));
      }
    });

    gzip.on("close", (code) => {
      if (code !== 0) {
        fail(new Error(`gzip exited with code ${code}: ${gzipStderr.trim()}`));
        return;
      }
    });

    out.on("finish", () => {
      if (settled) return;
      settled = true;
      resolve();
    });
  });
}

async function pruneOldBackups(dir: string, retentionDays: number): Promise<number> {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return 0;
    throw err;
  }

  let removed = 0;
  for (const name of entries) {
    if (!name.startsWith(BACKUP_FILENAME_PREFIX) || !name.endsWith(BACKUP_FILENAME_SUFFIX)) {
      continue;
    }
    const full = path.join(dir, name);
    try {
      const s = await stat(full);
      if (s.mtimeMs < cutoff) {
        await unlink(full);
        removed += 1;
        logger.info({ file: name }, "Pruned backup older than retention window");
      }
    } catch (err) {
      logger.warn(
        { file: name, err: (err as Error).message },
        "Failed to inspect/prune backup file",
      );
    }
  }
  return removed;
}

export async function runBackup(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set; skipping scheduled backup");
    return;
  }

  const dir = backupsDir();
  const startedAt = new Date();
  const filename = buildFilename(startedAt);
  const outFile = path.join(dir, filename);

  logger.info({ file: filename, dir }, "Starting database backup");
  const t0 = Date.now();

  try {
    await runPgDumpToGzipFile(databaseUrl, outFile);
    const s = await stat(outFile);
    const durationMs = Date.now() - t0;
    logger.info(
      {
        backup: "success",
        file: filename,
        bytes: s.size,
        durationMs,
      },
      `Backup completed: ${filename} (${s.size} bytes in ${durationMs}ms)`,
    );
  } catch (err) {
    const durationMs = Date.now() - t0;
    logger.error(
      {
        backup: "failed",
        file: filename,
        durationMs,
        err: (err as Error).message,
      },
      `Backup FAILED: ${filename} — ${(err as Error).message}`,
    );
    try {
      await unlink(outFile);
    } catch {
      // Output file may not exist if pg_dump failed before any write.
    }
    return;
  }

  try {
    const removed = await pruneOldBackups(dir, RETENTION_DAYS);
    if (removed > 0) {
      logger.info({ removed, retentionDays: RETENTION_DAYS }, "Pruned old backups");
    }
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "Backup prune step failed (non-fatal)");
  }
}

export async function findMostRecentBackupAgeMs(): Promise<number | null> {
  const dir = backupsDir();
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return null;
    throw err;
  }
  let newest = 0;
  for (const name of entries) {
    if (!name.startsWith(BACKUP_FILENAME_PREFIX) || !name.endsWith(BACKUP_FILENAME_SUFFIX)) {
      continue;
    }
    try {
      const s = await stat(path.join(dir, name));
      if (s.mtimeMs > newest) newest = s.mtimeMs;
    } catch {
      // skip unreadable files
    }
  }
  if (newest === 0) return null;
  return Date.now() - newest;
}
