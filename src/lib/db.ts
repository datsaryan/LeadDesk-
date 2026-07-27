import { Pool } from 'pg'

// A single pooled connection reused across serverless invocations where
// possible. `ssl: { rejectUnauthorized: false }` is standard for hosted
// Postgres providers (Supabase/Neon/Railway) that terminate TLS with a
// certificate not in Node's default trust store.
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

export const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  })

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool
}
