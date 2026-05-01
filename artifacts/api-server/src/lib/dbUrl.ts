import { logger } from "./logger";

if (process.env.NEON_DATABASE_URL && process.env.NEON_DATABASE_URL.length > 0) {
  if (process.env.DATABASE_URL !== process.env.NEON_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.NEON_DATABASE_URL;
    logger.info("DATABASE_URL overridden by NEON_DATABASE_URL");
  }
}
