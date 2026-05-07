import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { runDailyReminders } from "../jobs/reminders";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    req.log.warn("ADMIN_API_TOKEN not configured; admin endpoints are disabled");
    res.status(503).json({ error: "Admin API not configured" });
    return;
  }
  const headerToken = req.header("x-admin-token");
  const queryToken = typeof req.query.token === "string" ? req.query.token : undefined;
  const provided = headerToken ?? queryToken ?? "";
  if (provided !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function fingerprint(secret: string | undefined): {
  configured: boolean;
  length: number;
  prefix: string;
  last4: string;
} {
  if (!secret) {
    return { configured: false, length: 0, prefix: "", last4: "" };
  }
  return {
    configured: true,
    length: secret.length,
    prefix: secret.slice(0, 8),
    last4: secret.slice(-4),
  };
}

router.post("/admin/reminders/run", requireAdmin, async (req, res) => {
  try {
    const result = await runDailyReminders();
    res.json({ ok: true, result });
  } catch (err: any) {
    req.log.error({ err: err?.message }, "Manual reminder run failed");
    res.status(500).json({ ok: false, error: err?.message ?? "unknown" });
  }
});

router.get("/admin/diagnostics/secrets", requireAdmin, (_req, res) => {
  res.json({
    stripeWebhookSecret: fingerprint(process.env.STRIPE_WEBHOOK_SECRET),
    stripeSecretKey: fingerprint(process.env.STRIPE_SECRET_KEY),
    nodeEnv: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});

export default router;
