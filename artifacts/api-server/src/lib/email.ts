import { logger } from "./logger";

export const REMINDER_FROM = "VRAT <reminders@vrat-app.com>";

export async function sendResendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  from?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn("RESEND_API_KEY not set; skipping email send");
    return false;
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from ?? REMINDER_FROM,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      logger.warn({ status: resp.status, body, to: opts.to }, "Resend send failed");
      return false;
    }
    return true;
  } catch (err) {
    logger.warn({ err: (err as Error).message, to: opts.to }, "Resend send threw");
    return false;
  }
}

export async function sendWelcomeEmail(to: string): Promise<boolean> {
  const subject = "Welcome to VRAT — Your Sacred Fasting Companion 🙏";
  const text = [
    "Welcome to VRAT — we're so glad you're here.",
    "VRAT is your sacred companion for observing fasts with clarity and devotion, personalized to your tradition and sampradaya.",
    "Your 30-day free trial has begun — explore your tradition's fasting calendar, see what's allowed and avoided on each day, and never miss an Ekadashi, Purnima, or major vrat again.",
    "Open the app and select your tradition to see your upcoming fasts and daily mantras.",
    "Wishing you a blessed journey,\n— The VRAT team",
  ].join("\n\n");
  return sendResendEmail({ to, subject, text });
}
