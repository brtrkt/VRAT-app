import { Router, type IRouter } from "express";
import { storage } from "../storage";

const router: IRouter = Router();

const ERROR_TYPES = [
  "wrong-date",
  "missing-food",
  "wrong-mantra",
  "app-not-loading",
  "other",
] as const;
type ErrorType = (typeof ERROR_TYPES)[number];

function isErrorType(v: unknown): v is ErrorType {
  return typeof v === "string" && (ERROR_TYPES as readonly string[]).includes(v);
}

function cleanString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, max);
}

router.post("/error-reports", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;

  if (!isErrorType(body.errorType)) {
    req.log.warn({ body }, "Invalid error report payload");
    res.status(400).json({
      error: "Invalid errorType. Expected one of: " + ERROR_TYPES.join(", "),
    });
    return;
  }

  const errorType: ErrorType = body.errorType;
  const tradition = cleanString(body.tradition, 64);
  const page = cleanString(body.page, 256);
  const notes = cleanString(body.notes, 2000);
  const userAgent = cleanString(req.headers["user-agent"], 512);

  req.log.info(
    {
      reportType: "user_error_report",
      errorType,
      tradition,
      page,
      notes,
      userAgent,
      receivedAt: new Date().toISOString(),
    },
    `User error report: ${errorType}`,
  );

  try {
    const inserted = await storage.insertErrorReport({
      errorType,
      tradition,
      page,
      notes,
      userAgent,
    });
    res.json({ ok: true, id: inserted.id });
  } catch (err) {
    req.log.error({ err }, "Failed to persist error report");
    // We've already logged the report; respond ok so the user isn't blocked.
    res.json({ ok: true, persisted: false });
  }
});

router.get("/error-reports", async (req, res) => {
  const errorTypeRaw = typeof req.query.errorType === "string" ? req.query.errorType : "";
  const traditionRaw = typeof req.query.tradition === "string" ? req.query.tradition : "";
  const qRaw = typeof req.query.q === "string" ? req.query.q : "";

  const errorType = isErrorType(errorTypeRaw) ? errorTypeRaw : undefined;
  const tradition = traditionRaw.trim() || undefined;
  const q = qRaw.trim() || undefined;

  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? "50"), 10) || 50, 1),
    200,
  );
  const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);

  try {
    const { rows, total } = await storage.listErrorReports({
      errorType,
      tradition,
      q,
      limit,
      offset,
    });
    res.json({
      reports: rows,
      total,
      limit,
      offset,
      filters: { errorType: errorType ?? null, tradition: tradition ?? null, q: q ?? null },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list error reports");
    res.status(500).json({ error: "Failed to load error reports" });
  }
});

router.get("/error-reports/stats", async (_req, res) => {
  try {
    const stats = await storage.getErrorReportStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

export default router;
