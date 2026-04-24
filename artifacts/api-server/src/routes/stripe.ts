import { Router } from 'express';
import { storage } from '../storage';
import { getStripeClient, getWebhookSecret } from '../stripeClient';
import { logger } from '../lib/logger';

const router = Router();

router.post('/stripe/checkout', async (req, res) => {
  try {
    const { email, plan, currency } = req.body as {
      email: string;
      plan: 'monthly' | 'annual';
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
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { vrat_user_id: user.id },
      });
      customerId = customer.id;
      await storage.updateStripeCustomerId(user.email, customerId);
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/?checkout_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout_cancel=1`,
      customer_update: { address: 'auto' },
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
      return res.json({ subscribed: !!sub });
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
