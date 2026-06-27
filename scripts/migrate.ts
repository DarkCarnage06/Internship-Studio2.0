import { config } from 'dotenv';

config({ path: '.env.local' });

async function main() {
  const { runMigrations } = await import('../src/lib/migrations');
  await runMigrations();
  console.log('Migrations complete');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
