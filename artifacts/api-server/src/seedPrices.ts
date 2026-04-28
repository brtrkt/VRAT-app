import { Pool } from 'pg';
import { getStripeClient } from './stripeClient';
import { logger } from './lib/logger';

interface PriceSpec {
  plan: 'monthly' | 'annual' | 'lifetime';
  currency: 'usd' | 'inr';
  amount: number;
  recurring?: { interval: 'month' | 'year' };
  productName: string;
  productDescription: string;
}

const PRICE_SPECS: PriceSpec[] = [
  { plan: 'monthly',  currency: 'usd', amount: 299,    recurring: { interval: 'month' }, productName: 'VRAT Monthly',  productDescription: 'Full access to VRAT — your sacred fasting companion. Billed monthly.' },
  { plan: 'monthly',  currency: 'inr', amount: 24900,  recurring: { interval: 'month' }, productName: 'VRAT Monthly',  productDescription: 'Full access to VRAT — your sacred fasting companion. Billed monthly.' },
  { plan: 'annual',   currency: 'usd', amount: 1999,   recurring: { interval: 'year'  }, productName: 'VRAT Annual',   productDescription: 'Full access to VRAT — your sacred fasting companion. Billed annually. Best value.' },
  { plan: 'annual',   currency: 'inr', amount: 169900, recurring: { interval: 'year'  }, productName: 'VRAT Annual',   productDescription: 'Full access to VRAT — your sacred fasting companion. Billed annually. Best value.' },
  { plan: 'lifetime', currency: 'usd', amount: 4999,                                       productName: 'VRAT Lifetime', productDescription: 'Full access to VRAT forever — pay once, yours for life. No renewals.' },
  { plan: 'lifetime', currency: 'inr', amount: 399900,                                     productName: 'VRAT Lifetime', productDescription: 'Full access to VRAT forever — pay once, yours for life. No renewals.' },
];

async function findOrCreateProduct(
  stripe: ReturnType<typeof getStripeClient>,
  plan: PriceSpec['plan'],
  name: string,
  description: string,
): Promise<string> {
  const search = await stripe.products.search({
    query: `metadata['vrat_plan']:'${plan}' AND active:'true'`,
  });
  if (search.data.length > 0) return search.data[0].id;

  const created = await stripe.products.create({
    name,
    description,
    metadata: { vrat_plan: plan },
  });
  return created.id;
}

async function findOrCreatePrice(
  stripe: ReturnType<typeof getStripeClient>,
  productId: string,
  spec: PriceSpec,
): Promise<string> {
  const existing = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const match = existing.data.find(
    (p) =>
      p.currency === spec.currency &&
      p.unit_amount === spec.amount &&
      ((!spec.recurring && !p.recurring) ||
        (spec.recurring && p.recurring && p.recurring.interval === spec.recurring.interval)),
  );
  if (match) return match.id;

  const created = await stripe.prices.create({
    product: productId,
    unit_amount: spec.amount,
    currency: spec.currency,
    ...(spec.recurring ? { recurring: spec.recurring } : {}),
  });
  return created.id;
}

export async function ensurePricesSeeded(pool: Pool): Promise<void> {
  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM vrat_prices',
  );
  const existingCount = Number(rows[0]?.count ?? '0');

  if (existingCount >= PRICE_SPECS.length) {
    logger.info({ existingCount }, 'vrat_prices already populated, skipping seed');
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    logger.warn('STRIPE_SECRET_KEY not set, skipping price seed');
    return;
  }

  logger.info({ existingCount, target: PRICE_SPECS.length }, 'Seeding Stripe products and prices...');

  const stripe = getStripeClient();
  const productIds = new Map<PriceSpec['plan'], string>();

  for (const spec of PRICE_SPECS) {
    let productId = productIds.get(spec.plan);
    if (!productId) {
      productId = await findOrCreateProduct(stripe, spec.plan, spec.productName, spec.productDescription);
      productIds.set(spec.plan, productId);
    }

    const priceId = await findOrCreatePrice(stripe, productId, spec);

    await pool.query(
      `INSERT INTO vrat_prices (id, plan, currency, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (plan, currency) DO UPDATE
         SET id = EXCLUDED.id, amount = EXCLUDED.amount`,
      [priceId, spec.plan, spec.currency, spec.amount],
    );

    logger.info({ plan: spec.plan, currency: spec.currency, priceId }, 'Seeded price');
  }

  logger.info('All Stripe prices seeded successfully');
}
