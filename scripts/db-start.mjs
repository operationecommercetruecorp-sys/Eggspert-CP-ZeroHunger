// Starts a self-contained local Postgres for development (no Docker/Homebrew required).
// Binary + data live entirely under .pgdata/ in the repo (gitignored).
import EmbeddedPostgres from 'embedded-postgres';
import path from 'node:path';

const databaseDir = path.join(process.cwd(), '.pgdata');
const port = 55432;

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password: 'postgres',
  port,
  persistent: true,
});

async function main() {
  await pg.initialise();
  await pg.start();
  try {
    await pg.createDatabase('eggspert');
  } catch {
    // already exists
  }
  console.log(`Postgres ready at postgresql://postgres:postgres@localhost:${port}/eggspert`);
  console.log('Press Ctrl+C to stop.');
}

process.on('SIGINT', async () => {
  await pg.stop();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await pg.stop();
  process.exit(0);
});

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
