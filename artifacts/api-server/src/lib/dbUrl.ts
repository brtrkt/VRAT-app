import type { Pool } from "pg";
import { logger } from "./logger";

if (process.env.NEON_DATABASE_URL && process.env.NEON_DATABASE_URL.length > 0) {
  if (process.env.DATABASE_URL !== process.env.NEON_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.NEON_DATABASE_URL;
    logger.info("DATABASE_URL overridden by NEON_DATABASE_URL");
  }
}

// Neon's `neondb_owner` role ships with an empty `search_path` and the
// pooled endpoint ignores per-role `ALTER ROLE ... SET search_path`
// settings, so unqualified table references like `vrat_prices` fail
// with `relation "vrat_prices" does not exist`. All SQL in this server
// fully qualifies tables with the `public.` schema, so this is now a
// no-op kept only to give every Pool a single place for future
// connection-level config.
export function configurePoolSearchPath(pool: Pool): Pool {
  return pool;
}
