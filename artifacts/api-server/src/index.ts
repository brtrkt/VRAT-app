import app from "./app";
import { logger } from "./lib/logger";
import { storage } from "./storage";

async function initSchema() {
  try {
    logger.info('Initializing database schema...');
    await storage.initSchema();
    logger.info('Database schema ready');
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Database schema init failed');
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

await initSchema();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
