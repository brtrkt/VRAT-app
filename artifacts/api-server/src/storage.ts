import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });
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
  async initSchema(): Promise<void> {
    const db = getPool();
    await db.query(`
      CREATE TABLE IF NOT EXISTS vrat_users (
        id          TEXT PRIMARY KEY,
        email       TEXT UNIQUE NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        trial_started_at TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS vrat_subscriptions (
        stripe_customer_id    TEXT PRIMARY KEY,
        stripe_subscription_id TEXT NOT NULL,
        status                TEXT NOT NULL,
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS vrat_prices (
        id       TEXT PRIMARY KEY,
        plan     TEXT NOT NULL,
        currency TEXT NOT NULL,
        amount   INTEGER NOT NULL,
        UNIQUE (plan, currency)
      );
    `);
  }

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

  async upsertSubscription(
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    status: string
  ): Promise<void> {
    const db = getPool();
    await db.query(
      `INSERT INTO vrat_subscriptions (stripe_customer_id, stripe_subscription_id, status, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (stripe_customer_id) DO UPDATE
         SET stripe_subscription_id = EXCLUDED.stripe_subscription_id,
             status = EXCLUDED.status,
             updated_at = NOW()`,
      [stripeCustomerId, stripeSubscriptionId, status]
    );
  }

  async getActiveSubscriptionForCustomer(stripeCustomerId: string): Promise<any | null> {
    const db = getPool();
    const result = await db.query(
      `SELECT * FROM vrat_subscriptions
       WHERE stripe_customer_id = $1
         AND status IN ('active', 'trialing')
       LIMIT 1`,
      [stripeCustomerId]
    );
    return result.rows[0] || null;
  }

  async getPriceByPlanAndCurrency(plan: 'monthly' | 'annual', currency: 'usd' | 'inr'): Promise<string | null> {
    const db = getPool();
    const result = await db.query(
      `SELECT id FROM vrat_prices WHERE plan = $1 AND currency = $2 LIMIT 1`,
      [plan, currency]
    );
    return result.rows[0]?.id || null;
  }

  async upsertPrice(id: string, plan: string, currency: string, amount: number): Promise<void> {
    const db = getPool();
    await db.query(
      `INSERT INTO vrat_prices (id, plan, currency, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (plan, currency) DO UPDATE
         SET id = EXCLUDED.id, amount = EXCLUDED.amount`,
      [id, plan, currency, amount]
    );
  }
}

export const storage = new Storage();
