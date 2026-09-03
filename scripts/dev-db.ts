/**
 * Local development Postgres via embedded-postgres (no Docker needed).
 * Starts a real Postgres server on port 5503 with data in ./.pgdata.
 * Keep this running in a terminal:  npm run db:start
 * Production uses a hosted Postgres (Neon/Supabase) via DATABASE_URL instead.
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), ".pgdata");
const PORT = 5503;
const DB_NAME = "personnel";

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: "postgres",
    password: "postgres",
    port: PORT,
    persistent: true,
    // Windows initdb defaults to WIN1252 which rejects Arabic text
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
  });

  const firstRun = !existsSync(join(DATA_DIR, "PG_VERSION"));
  if (firstRun) {
    console.log("Initializing new Postgres cluster in .pgdata ...");
    await pg.initialise();
  }

  await pg.start();
  if (firstRun) {
    await pg.createDatabase(DB_NAME);
  }

  console.log(`✅ Postgres running: postgresql://postgres:postgres@127.0.0.1:${PORT}/${DB_NAME}`);
  console.log("Press Ctrl+C to stop.");

  const shutdown = async () => {
    console.log("\nStopping Postgres ...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
