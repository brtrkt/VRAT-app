import { getStripeClient } from './stripeClient';
import pg from 'pg';

const { Pool } = pg;

async function savePrice(pool: pg.Pool, id: string, plan: string, currency: string, amount: number) {
  await pool.query(
    `INSERT INTO vrat_prices (id, plan, currency, amount)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (plan, currency) DO UPDATE
       SET id = EXCLUDED.id, amount = EXCLUDED.amount`,
    [id, plan, currency, amount]
  );
}

async function seedProducts() {
  const stripe = getStripeClient();

  const databaseUrl = process.env.DATABASE_URL;
  const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

  if (pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vrat_prices (
        id       TEXT PRIMARY KEY,
        plan     TEXT NOT NULL,
        currency TEXT NOT NULL,
        amount   INTEGER NOT NULL,
        UNIQUE (plan, currency)
      )
    `);
    console.log('✓ vrat_prices table ready');
  }

  console.log('\nChecking existing VRAT products in Stripe...');

  const existing = await stripe.products.search({
    query: "metadata['vrat_plan']:'monthly' AND active:'true'",
  });

  if (existing.data.length > 0) {
    console.log('VRAT products already exist. Listing current prices:\n');
    for (const product of existing.data) {
      const prices = await stripe.prices.list({ product: product.id, active: true });
      for (const price of prices.data) {
        const amount = (price.unit_amount ?? 0) / 100;
        const symbol = price.currency === 'inr' ? '₹' : '$';
        const plan = (product.metadata as any).vrat_plan as string;
        console.log(`  ${product.name} — ${symbol}${amount} ${price.currency.toUpperCase()} (${price.id})`);
        if (pool) {
          await savePrice(pool, price.id, plan, price.currency, price.unit_amount ?? 0);
          console.log(`    ↳ saved to vrat_prices`);
        }
      }
    }

    // Also check annual
    const existingAnnual = await stripe.products.search({
      query: "metadata['vrat_plan']:'annual' AND active:'true'",
    });
    for (const product of existingAnnual.data) {
      const prices = await stripe.prices.list({ product: product.id, active: true });
      for (const price of prices.data) {
        const amount = (price.unit_amount ?? 0) / 100;
        const symbol = price.currency === 'inr' ? '₹' : '$';
        const plan = (product.metadata as any).vrat_plan as string;
        console.log(`  ${product.name} — ${symbol}${amount} ${price.currency.toUpperCase()} (${price.id})`);
        if (pool) {
          await savePrice(pool, price.id, plan, price.currency, price.unit_amount ?? 0);
          console.log(`    ↳ saved to vrat_prices`);
        }
      }
    }

    if (pool) await pool.end();
    return;
  }

  console.log('Creating VRAT subscription products...\n');

  const monthly = await stripe.products.create({
    name: 'VRAT Monthly',
    description: 'Full access to VRAT — your sacred fasting companion. Billed monthly.',
    metadata: { vrat_plan: 'monthly' },
  });
  console.log(`✓ Created product: ${monthly.name} (${monthly.id})`);

  const monthlyUsd = await stripe.prices.create({
    product: monthly.id,
    unit_amount: 299,
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  console.log(`  ✓ USD price: $2.99/month (${monthlyUsd.id})`);
  if (pool) await savePrice(pool, monthlyUsd.id, 'monthly', 'usd', 299);

  const monthlyInr = await stripe.prices.create({
    product: monthly.id,
    unit_amount: 24900,
    currency: 'inr',
    recurring: { interval: 'month' },
  });
  console.log(`  ✓ INR price: ₹249/month (${monthlyInr.id})`);
  if (pool) await savePrice(pool, monthlyInr.id, 'monthly', 'inr', 24900);

  const annual = await stripe.products.create({
    name: 'VRAT Annual',
    description: 'Full access to VRAT — your sacred fasting companion. Billed annually. Best value.',
    metadata: { vrat_plan: 'annual' },
  });
  console.log(`\n✓ Created product: ${annual.name} (${annual.id})`);

  const annualUsd = await stripe.prices.create({
    product: annual.id,
    unit_amount: 1999,
    currency: 'usd',
    recurring: { interval: 'year' },
  });
  console.log(`  ✓ USD price: $19.99/year (${annualUsd.id})`);
  if (pool) await savePrice(pool, annualUsd.id, 'annual', 'usd', 1999);

  const annualInr = await stripe.prices.create({
    product: annual.id,
    unit_amount: 169900,
    currency: 'inr',
    recurring: { interval: 'year' },
  });
  console.log(`  ✓ INR price: ₹1,699/year (${annualInr.id})`);
  if (pool) await savePrice(pool, annualInr.id, 'annual', 'inr', 169900);

  console.log('\n✅ All products and prices created and saved to database!');

  if (pool) await pool.end();
}

seedProducts().catch((err) => {
  console.error('Error seeding products:', err.message);
  process.exit(1);
});
