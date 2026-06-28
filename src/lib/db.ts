import { neon } from '@neondatabase/serverless';

export function getSql() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('No database connection string was provided.');
  }

  return neon(connectionString);
}

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  const database = getSql();
  return database(strings as never, ...values as never[]);
}
