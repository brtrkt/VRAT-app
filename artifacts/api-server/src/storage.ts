import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export interface VratUser {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_started_at: Date | null;
  created_at: Date;
}

export class Storage {
  async getOrCreateUser(email: string): Promise<VratUser> {
    const db = getPool();
    const normalized = email.trim().toLowerCase();
    const id = `user_${normalized.replace(/[^a-z0-9]/g, '_')}`;

    const result = await db.query<VratUser>(
      `INSERT INTO vrat_users (id, email)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING *`,
      [id, normalized]
    );
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<VratUser | null> {
    const db = getPool();
    const result = await db.query<VratUser>(
      'SELECT * FROM vrat_users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    return result.rows[0] || null;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<VratUser | null> {
    const db = getPool();
    const result = await db.query<VratUser>(
      'SELECT * FROM vrat_users WHERE stripe_customer_id = $1',
      [customerId]
    );
    return result.rows[0] || null;
  }

  async updateStripeCustomerId(email: string, stripeCustomerId: string): Promise<void> {
    const db = getPool();
    await db.query(
      'UPDATE vrat_users SET stripe_customer_id = $1 WHERE email = $2',
      [stripeCustomerId, email.trim().toLowerCase()]
    );
  }

  async getActiveSubscriptionForCustomer(stripeCustomerId: string): Promise<any | null> {
    const db = getPool();
    const result = await db.query(
      `SELECT * FROM stripe.subscriptions
       WHERE customer = $1
         AND status IN ('active', 'trialing')
       LIMIT 1`,
      [stripeCustomerId]
    );
    return result.rows[0] || null;
  }

  async getPriceByPlanAndCurrency(plan: 'monthly' | 'annual', currency: 'usd' | 'inr'): Promise<string | null> {
    const db = getPool();
    const interval = plan === 'monthly' ? 'month' : 'year';
    const result = await db.query(
      `SELECT pr.id FROM stripe.prices pr
       JOIN stripe.products p ON pr.product = p.id
       WHERE pr.active = true
         AND pr.currency = $1
         AND pr.recurring->>'interval' = $2
         AND p.active = true
         AND p.metadata->>'vrat_plan' IS NOT NULL
       LIMIT 1`,
      [currency, interval]
    );
    return result.rows[0]?.id || null;
  }
}

export const storage = new Storage();
