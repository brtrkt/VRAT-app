import { Router } from 'express';
import { storage } from '../storage';
import { getStripeClient } from '../stripeClient';
import { logger } from '../lib/logger';

const router = Router();

router.post('/stripe/checkout', async (req, res) => {
  try {
    const { email, plan, currency } = req.body as {
      email: string;
      plan: 'monthly' | 'annual' | 'lifetime';
      currency: 'usd' | 'inr';
    };

    if (!email || !plan || !currency) {
      return res.status(400).json({ error: 'email, plan, and currency are required' });
    }

    const priceId = await storage.getPriceByPlanAndCurrency(plan, currency);
    if (!priceId) {
      return res.status(404).json({
        error: 'Price not found. Products may not be seeded yet.',
        hint: 'Run: pnpm --filter @workspace/scripts run seed-products'
      });
    }

    const user = await storage.getOrCreateUser(email);
    const stripe = getStripeClient();

    let customerId = user.stripe_customer_id;
    if (customerId) {
      try {
        const existing = await stripe.customers.retrieve(customerId);
        if ((existing as any).deleted) {
          customerId = null;
        }
      } catch (err: any) {
        if (err?.code === 'resource_missing' || err?.statusCode === 404) {
          logger.warn(
            { email: user.email, staleCustomerId: customerId },
            'Cached Stripe customer not found — likely from previous Stripe mode (test↔live). Creating a fresh customer.',
          );
          customerId = null;
        } else {
          throw err;
        }
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { vrat_user_id: user.id },
      });
      customerId = customer.id;
      await storage.updateStripeCustomerId(user.email, customerId);
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const isLifetime = plan === 'lifetime';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isLifetime ? 'payment' : 'subscription',
      success_url: `${origin}/?checkout_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout_cancel=1`,
      ...(!isLifetime && { customer_update: { address: 'auto' } }),
      automatic_tax: { enabled: false },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err }, 'Checkout session creation failed');
    res.status(500).json({ error: err.message });
  }
});

router.get('/stripe/verify', async (req, res) => {
  try {
    const { session_id, email } = req.query as { session_id?: string; email?: string };

    if (session_id) {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['subscription'],
      });

      if (session.payment_status === 'paid' && session.status === 'complete') {
        const customerEmail = session.customer_email || (session.customer_details?.email ?? '');
        if (customerEmail) {
          await storage.getOrCreateUser(customerEmail);
          if (session.customer && typeof session.customer === 'string') {
            await storage.updateStripeCustomerId(customerEmail, session.customer);
            if (session.mode === 'payment') {
              await storage.upsertSubscription(session.customer, session.id, 'lifetime');
            }
          }
        }
        return res.json({ subscribed: true, email: customerEmail });
      }

      return res.json({ subscribed: false });
    }

    if (email) {
      const user = await storage.getUserByEmail(email);
      if (!user?.stripe_customer_id) {
        return res.json({ subscribed: false });
      }

      const sub = await storage.getActiveSubscriptionForCustomer(user.stripe_customer_id);
      if (!sub) return res.json({ subscribed: false });

      return res.json({
        subscribed: true,
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: sub.current_period_end ? sub.current_period_end.toISOString() : null,
      });
    }

    return res.status(400).json({ error: 'session_id or email is required' });
  } catch (err: any) {
    logger.error({ err }, 'Subscription verify failed');
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/portal', async (req, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) return res.status(400).json({ error: 'email is required' });

    const user = await storage.getUserByEmail(email);
    if (!user?.stripe_customer_id) {
      return res.status(404).json({ error: 'No subscription found for this email' });
    }

    const stripe = getStripeClient();

    try {
      const existing = await stripe.customers.retrieve(user.stripe_customer_id);
      if ((existing as any).deleted) {
        return res.status(404).json({ error: 'No active subscription found for this email' });
      }
    } catch (err: any) {
      if (err?.code === 'resource_missing' || err?.statusCode === 404) {
        logger.warn(
          { email, staleCustomerId: user.stripe_customer_id },
          'Portal: cached Stripe customer not found in current Stripe mode',
        );
        return res.status(404).json({ error: 'No active subscription found for this email' });
      }
      throw err;
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: origin,
    });

    res.json({ url: portalSession.url });
  } catch (err: any) {
    logger.error({ err }, 'Portal session creation failed');
    res.status(500).json({ error: err.message });
  }
});

export default router;
