import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Checking existing VRAT products in Stripe...');

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
        console.log(`  ${product.name} — ${symbol}${amount} ${price.currency.toUpperCase()} (${price.id})`);
      }
    }
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

  const monthlyInr = await stripe.prices.create({
    product: monthly.id,
    unit_amount: 24900,
    currency: 'inr',
    recurring: { interval: 'month' },
  });
  console.log(`  ✓ INR price: ₹249/month (${monthlyInr.id})`);

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

  const annualInr = await stripe.prices.create({
    product: annual.id,
    unit_amount: 169900,
    currency: 'inr',
    recurring: { interval: 'year' },
  });
  console.log(`  ✓ INR price: ₹1,699/year (${annualInr.id})`);

  console.log('\n✅ All products and prices created successfully!');
  console.log('Webhooks will sync this data to your database automatically.');
}

seedProducts().catch((err) => {
  console.error('Error seeding products:', err.message);
  process.exit(1);
});
