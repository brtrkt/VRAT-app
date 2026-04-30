import { Router, type IRouter } from "express";

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

router.post("/error-reports", (req, res) => {
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

  req.log.info(
    {
      reportType: "user_error_report",
      errorType,
      tradition,
      page,
      notes,
      userAgent: req.headers["user-agent"] ?? null,
      receivedAt: new Date().toISOString(),
    },
    `User error report: ${errorType}`,
  );

  res.json({ ok: true });
});

export default router;
