import { Pool } from 'pg';
import { configurePoolSearchPath } from './lib/dbUrl';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = configurePoolSearchPath(new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    }));
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
    // All table refs are fully qualified with the `public.` schema —
    // Neon's pooled endpoint ships with an empty search_path that breaks
    // unqualified references.
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.vrat_users (
        id          TEXT PRIMARY KEY,
        email       TEXT UNIQUE NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        trial_started_at TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.vrat_subscriptions (
        stripe_customer_id    TEXT PRIMARY KEY,
        stripe_subscription_id TEXT NOT NULL,
        status                TEXT NOT NULL,
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE public.vrat_subscriptions
        ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

      ALTER TABLE public.vrat_subscriptions
        ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS public.vrat_prices (
        id       TEXT PRIMARY KEY,
        plan     TEXT NOT NULL,
        currency TEXT NOT NULL,
        amount   INTEGER NOT NULL,
        UNIQUE (plan, currency)
      );

      CREATE TABLE IF NOT EXISTS public.vrat_error_reports (
        id          BIGSERIAL PRIMARY KEY,
        error_type  TEXT NOT NULL,
        tradition   TEXT,
        page        TEXT,
        notes       TEXT,
        user_agent  TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_vrat_error_reports_created_at
        ON public.vrat_error_reports (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_vrat_error_reports_error_type
        ON public.vrat_error_reports (error_type);
      CREATE INDEX IF NOT EXISTS idx_vrat_error_reports_tradition
        ON public.vrat_error_reports (tradition);
    `);
  }

  async insertErrorReport(input: {
    errorType: string;
    tradition: string | null;
    page: string | null;
    notes: string | null;
    userAgent: string | null;
  }): Promise<{ id: string; created_at: Date }> {
    const db = getPool();
    const result = await db.query<{ id: string; created_at: Date }>(
      `INSERT INTO public.vrat_error_reports (error_type, tradition, page, notes, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id::text, created_at`,
      [input.errorType, input.tradition, input.page, input.notes, input.userAgent]
    );
    return result.rows[0];
  }

  async listErrorReports(filters: {
    errorType?: string;
    tradition?: string;
    q?: string;
    limit: number;
    offset: number;
  }): Promise<{
    rows: Array<{
      id: string;
      error_type: string;
      tradition: string | null;
      page: string | null;
      notes: string | null;
      user_agent: string | null;
      created_at: Date;
    }>;
    total: number;
  }> {
    const db = getPool();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.errorType) {
      params.push(filters.errorType);
      conditions.push(`error_type = $${params.length}`);
    }
    if (filters.tradition) {
      params.push(filters.tradition);
      conditions.push(`tradition = $${params.length}`);
    }
    if (filters.q) {
      params.push(`%${filters.q}%`);
      conditions.push(`(notes ILIKE $${params.length} OR page ILIKE $${params.length})`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM public.vrat_error_reports ${where}`,
      params
    );
    const total = Number(countResult.rows[0]?.count ?? 0);

    params.push(filters.limit);
    const limitIdx = params.length;
    params.push(filters.offset);
    const offsetIdx = params.length;

    const result = await db.query(
      `SELECT id::text, error_type, tradition, page, notes, user_agent, created_at
       FROM public.vrat_error_reports
       ${where}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    return { rows: result.rows, total };
  }

  async getErrorReportStats(): Promise<{
    total: number;
    byErrorType: Array<{ error_type: string; count: number }>;
    byTradition: Array<{ tradition: string | null; count: number }>;
    last7Days: number;
    last24Hours: number;
  }> {
    const db = getPool();
    const [totalRes, byTypeRes, byTradRes, last7Res, last24Res] = await Promise.all([
      db.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM public.vrat_error_reports`),
      db.query<{ error_type: string; count: string }>(
        `SELECT error_type, COUNT(*)::text AS count
         FROM public.vrat_error_reports
         GROUP BY error_type
         ORDER BY count DESC`
      ),
      db.query<{ tradition: string | null; count: string }>(
        `SELECT tradition, COUNT(*)::text AS count
         FROM public.vrat_error_reports
         GROUP BY tradition
         ORDER BY count DESC
         LIMIT 20`
      ),
      db.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM public.vrat_error_reports
         WHERE created_at >= NOW() - INTERVAL '7 days'`
      ),
      db.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM public.vrat_error_reports
         WHERE created_at >= NOW() - INTERVAL '24 hours'`
      ),
    ]);
    return {
      total: Number(totalRes.rows[0]?.count ?? 0),
      byErrorType: byTypeRes.rows.map(r => ({ error_type: r.error_type, count: Number(r.count) })),
      byTradition: byTradRes.rows.map(r => ({ tradition: r.tradition, count: Number(r.count) })),
      last7Days: Number(last7Res.rows[0]?.count ?? 0),
      last24Hours: Number(last24Res.rows[0]?.count ?? 0),
    };
  }

  async getOrCreateUser(email: string): Promise<VratUser> {
    const db = getPool();
    const normalized = email.trim().toLowerCase();
    const id = `user_${normalized.replace(/[^a-z0-9]/g, '_')}`;

    const result = await db.query<VratUser>(
      `INSERT INTO public.vrat_users (id, email)
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
      'SELECT * FROM public.vrat_users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    return result.rows[0] || null;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<VratUser | null> {
    const db = getPool();
    const result = await db.query<VratUser>(
      'SELECT * FROM public.vrat_users WHERE stripe_customer_id = $1',
      [customerId]
    );
    return result.rows[0] || null;
  }

  async updateStripeCustomerId(email: string, stripeCustomerId: string): Promise<void> {
    const db = getPool();
    await db.query(
      'UPDATE public.vrat_users SET stripe_customer_id = $1 WHERE email = $2',
      [stripeCustomerId, email.trim().toLowerCase()]
    );
  }

  async upsertSubscription(
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    status: string,
    options: {
      cancelAtPeriodEnd?: boolean;
      currentPeriodEnd?: Date | null;
    } = {}
  ): Promise<void> {
    const db = getPool();
    const cancelAtPeriodEnd = options.cancelAtPeriodEnd ?? false;
    const currentPeriodEnd = options.currentPeriodEnd ?? null;
    await db.query(
      `INSERT INTO public.vrat_subscriptions
         (stripe_customer_id, stripe_subscription_id, status,
          cancel_at_period_end, current_period_end, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (stripe_customer_id) DO UPDATE
         SET stripe_subscription_id  = EXCLUDED.stripe_subscription_id,
             status                  = EXCLUDED.status,
             cancel_at_period_end    = EXCLUDED.cancel_at_period_end,
             current_period_end      = EXCLUDED.current_period_end,
             updated_at              = NOW()`,
      [stripeCustomerId, stripeSubscriptionId, status, cancelAtPeriodEnd, currentPeriodEnd]
    );
  }

  async getActiveSubscriptionForCustomer(stripeCustomerId: string): Promise<{
    stripe_customer_id: string;
    stripe_subscription_id: string;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: Date | null;
    updated_at: Date;
  } | null> {
    const db = getPool();
    const result = await db.query(
      `SELECT * FROM public.vrat_subscriptions
       WHERE stripe_customer_id = $1
         AND status IN ('active', 'trialing', 'lifetime')
       LIMIT 1`,
      [stripeCustomerId]
    );
    return result.rows[0] || null;
  }

  async getPriceByPlanAndCurrency(plan: 'monthly' | 'annual' | 'lifetime', currency: 'usd' | 'inr'): Promise<string | null> {
    const db = getPool();
    const result = await db.query(
      `SELECT id FROM public.vrat_prices WHERE plan = $1 AND currency = $2 LIMIT 1`,
      [plan, currency]
    );
    return result.rows[0]?.id || null;
  }

  async upsertPrice(id: string, plan: string, currency: string, amount: number): Promise<void> {
    const db = getPool();
    await db.query(
      `INSERT INTO public.vrat_prices (id, plan, currency, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (plan, currency) DO UPDATE
         SET id = EXCLUDED.id, amount = EXCLUDED.amount`,
      [id, plan, currency, amount]
    );
  }
}

export const storage = new Storage();
