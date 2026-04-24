import Stripe from 'stripe';

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set. Add it to your Replit Secrets.');
  }
  return new Stripe(secretKey);
}
