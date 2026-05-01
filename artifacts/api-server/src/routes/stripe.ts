import { Router } from 'express';
import type Stripe from 'stripe';
import { storage } from '../storage';
import { getStripeClient } from '../stripeClient';
import { logger } from '../lib/logger';

const router = Router();

// Look up an active Stripe Promotion Code by its customer-facing code
// and validate it against a given price (plan + currency). Returns the
// computed discounted amount so the UI can show savings before checkout.
router.post('/stripe/validate-promo', async (req, res) => {
  try {
    const { code, plan, currency } = req.body as {
      code?: string;
      plan?: 'monthly' | 'annual' | 'lifetime';
      currency?: 'usd' | 'inr';
    };

    if (!code || !plan || !currency) {
      return res.status(400).json({ valid: false, error: 'code, plan, and currency are required' });
    }

    const trimmed = code.trim();
    if (!trimmed) {
      return res.status(400).json({ valid: false, error: 'Code is required' });
    }

    const priceId = await storage.getPriceByPlanAndCurrency(plan, currency);
    if (!priceId) {
      return res.status(404).json({ valid: false, error: 'Price not found' });
    }

    const stripe = getStripeClient();

    const price = await stripe.prices.retrieve(priceId);
    const unitAmount = price.unit_amount ?? 0;

    const promoList = await stripe.promotionCodes.list({
      code: trimmed,
      active: true,
      limit: 1,
    });
    const promo = promoList.data[0];

    if (!promo) {
      return res.json({ valid: false, error: 'This code is not valid.' });
    }

    if (promo.expires_at && promo.expires_at * 1000 < Date.now()) {
      return res.json({ valid: false, error: 'This code has expired.' });
    }

    if (promo.max_redemptions && promo.times_redeemed >= promo.max_redemptions) {
      return res.json({ valid: false, error: 'This code has reached its redemption limit.' });
    }

    const coupon = (promo as Stripe.PromotionCode & { coupon: Stripe.Coupon }).coupon;
    if (!coupon || !coupon.valid) {
      return res.json({ valid: false, error: 'This code is no longer valid.' });
    }

    if (coupon.currency && coupon.currency.toLowerCase() !== currency.toLowerCase()) {
      return res.json({ valid: false, error: 'This code does not apply to the selected currency.' });
    }

    const minAmount = promo.restrictions?.minimum_amount;
    if (typeof minAmount === 'number' && unitAmount < minAmount) {
      return res.json({ valid: false, error: 'This code requires a higher plan.' });
    }

    let discountedAmount = unitAmount;
    let discountLabel = '';
    if (typeof coupon.percent_off === 'number' && coupon.percent_off > 0) {
      discountedAmount = Math.max(0, Math.round(unitAmount * (1 - coupon.percent_off / 100)));
      discountLabel = `${coupon.percent_off}% off`;
    } else if (typeof coupon.amount_off === 'number' && coupon.amount_off > 0) {
      discountedAmount = Math.max(0, unitAmount - coupon.amount_off);
      discountLabel = 'discount applied';
    } else {
      return res.json({ valid: false, error: 'This code has no discount value.' });
    }

    return res.json({
      valid: true,
      code: promo.code,
      promotionCodeId: promo.id,
      currency,
      originalAmount: unitAmount,
      discountedAmount,
      discountLabel,
      duration: coupon.duration,
      durationInMonths: coupon.duration_in_months ?? null,
    });
  } catch (err: any) {
    logger.error({ err }, 'Promo validation failed');
    return res.status(500).json({ valid: false, error: 'Could not validate code. Please try again.' });
  }
});

router.post('/stripe/checkout', async (req, res) => {
  try {
    const { email, plan, currency, promoCode } = req.body as {
      email: string;
      plan: 'monthly' | 'annual' | 'lifetime';
      currency: 'usd' | 'inr';
      promoCode?: string;
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

    // If the caller pre-applied a promo code on the paywall, resolve it
    // server-side so we can attach it as a checkout discount and so an
    // invalid code is rejected with a clear error rather than silently
    // creating a full-price session.
    let promotionCodeId: string | null = null;
    if (promoCode && promoCode.trim()) {
      const promoList = await stripe.promotionCodes.list({
        code: promoCode.trim(),
        active: true,
        limit: 1,
      });
      const promo = promoList.data[0];
      if (!promo) {
        return res.status(400).json({ error: 'The promo code is no longer valid. Please re-apply it.' });
      }
      promotionCodeId = promo.id;
    }

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

    // Stripe disallows combining `allow_promotion_codes` with `discounts`;
    // apply the explicit discount when one was pre-validated, otherwise
    // keep the in-checkout promo input enabled.
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isLifetime ? 'payment' : 'subscription',
      success_url: `${origin}/?checkout_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout_cancel=1`,
      ...(!isLifetime && { customer_update: { address: 'auto' } }),
      automatic_tax: { enabled: false },
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : { allow_promotion_codes: true }),
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err }, 'Checkout session creation failed');
    return res.status(500).json({ error: err.message });
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
    return res.status(500).json({ error: err.message });
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

    return res.json({ url: portalSession.url });
  } catch (err: any) {
    logger.error({ err }, 'Portal session creation failed');
    return res.status(500).json({ error: err.message });
  }
});

export default router;
