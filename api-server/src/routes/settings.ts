import { Router, type IRouter, type Request, type Response } from "express";
import { storage } from "../storage";

const router: IRouter = Router();

function isValidUserId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 200;
}

router.get("/settings", async (req: Request, res: Response) => {
  const userId = req.query.user_id;
  if (!isValidUserId(userId)) {
    return res.status(400).json({ error: "user_id required" });
  }
  try {
    const settings = await storage.getUserSettings(userId);
    if (!settings) {
      return res.status(200).json({ found: false });
    }
    return res.status(200).json({
      found: true,
      tradition: settings.tradition,
      observed: settings.observed ?? [],
      city: settings.city,
      location: settings.location,
      region: settings.region,
      updated_at: settings.updated_at,
    });
  } catch (err) {
    req.log?.error?.({ err }, "GET /api/settings failed");
    return res.status(500).json({ error: "internal_error" });
  }
});

router.put("/settings", async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const userId = body.user_id;
  if (!isValidUserId(userId)) {
    return res.status(400).json({ error: "user_id required" });
  }

  const tradition = typeof body.tradition === "string" ? body.tradition : null;
  const city = typeof body.city === "string" ? body.city : null;
  const location = typeof body.location === "string" ? body.location : null;
  const region = typeof body.region === "string" ? body.region : null;
  const observed = Array.isArray(body.observed)
    ? body.observed.filter((v): v is string => typeof v === "string")
    : null;

  try {
    await storage.upsertUserSettings({
      userId,
      tradition,
      observed,
      city,
      location,
      region,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    req.log?.error?.({ err }, "PUT /api/settings failed");
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
