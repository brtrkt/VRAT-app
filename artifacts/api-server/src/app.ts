import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getStripeClient, getWebhookSecret } from "./stripeClient";
import { storage } from "./storage";

const app: Express = express();

const allowedOrigins = [
  /\.netlify\.app$/,
  /\.replit\.dev$/,
  /\.repl\.co$/,
  /^http:\/\/localhost/,
  /^https?:\/\/(www\.)?vrat-app\.com$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((pattern) =>
        typeof pattern === 'string' ? origin === pattern : pattern.test(origin)
      );
      callback(null, allowed ? origin : false);
    },
    credentials: true,
  })
);

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) return res.status(400).json({ error: 'Missing stripe-signature' });

    try {
      const stripe = getStripeClient();
      const webhookSecret = getWebhookSecret();
      const signature = Array.isArray(sig) ? sig[0] : sig;
      const event = stripe.webhooks.constructEvent(req.body as Buffer, signature, webhookSecret);

      logger.info({ type: event.type }, 'Stripe webhook received');

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const sub = event.data.object as any;
          const cancelAtPeriodEnd = Boolean(sub.cancel_at_period_end);
          const periodEndUnix: number | null =
            typeof sub.current_period_end === 'number' ? sub.current_period_end : null;
          const currentPeriodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : null;

          await storage.upsertSubscription(sub.customer, sub.id, sub.status, {
            cancelAtPeriodEnd,
            currentPeriodEnd,
          });

          if (cancelAtPeriodEnd) {
            logger.info(
              { customerId: sub.customer, subscriptionId: sub.id, currentPeriodEnd },
              'Subscription scheduled to cancel at period end',
            );
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as any;
          await storage.upsertSubscription(sub.customer, sub.id, 'canceled', {
            cancelAtPeriodEnd: false,
            currentPeriodEnd: null,
          });
          logger.info(
            { customerId: sub.customer, subscriptionId: sub.id },
            'Subscription deleted — premium access revoked',
          );
          break;
        }
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          if (session.mode === 'payment' && session.payment_status === 'paid') {
            const customerId = typeof session.customer === 'string' ? session.customer : null;
            if (customerId) {
              await storage.upsertSubscription(customerId, session.id, 'lifetime');
              logger.info({ customerId }, 'Lifetime purchase recorded');
            }
          }
          break;
        }
      }

      res.status(200).json({ received: true });
    } catch (err: any) {
      logger.error({ err }, 'Webhook error');
      res.status(400).json({ error: err.message });
    }
  }
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
