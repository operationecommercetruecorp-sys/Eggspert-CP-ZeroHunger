import EmbeddedPostgres from 'embedded-postgres';
import path from 'node:path';

const pg = new EmbeddedPostgres({
  databaseDir: path.join(process.cwd(), '.pgdata'),
  user: 'postgres',
  password: 'postgres',
  port: 55432,
  persistent: true,
});

pg.stop()
  .then(() => console.log('Postgres stopped.'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
