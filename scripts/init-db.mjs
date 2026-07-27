// Run with: npm run db:init
// Applies scripts/init-db.sql against DATABASE_URL. Simple and explicit —
// no migration framework needed for a single-table app on a 24-hour clock.
import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in first.')
  process.exit(1)
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function main() {
  await client.connect()
  const sql = readFileSync(join(__dirname, 'init-db.sql'), 'utf-8')
  await client.query(sql)
  console.log('✓ leads table ready')
  await client.end()
}

main().catch((err) => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
