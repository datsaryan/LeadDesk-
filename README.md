# LeadDesk Mini

> A real lead-capture tool: a public landing page with a validated form, a
> Postgres-backed database, and a password-protected admin pipeline view.

Built for the [Digital Heroes](https://digitalheroesco.com) Full Stack
Development internship qualification task (Role 04, Task A + B).

**Live demo:** _add your Vercel URL_
**Admin URL:** _your-url_/admin
**Test credentials:** _add the admin email + password you set_

## Features

- Public landing page with a lead form (name, email, budget range, message)
- Client-side **and** server-side validation, using the same Zod schema so
  the browser and the API reject identical bad input
- Real Postgres storage via parameterized SQL (no ORM binary dependency —
  chosen deliberately to avoid native-binding install issues on serverless)
- Admin dashboard at `/admin`: search by name/email, filter by status,
  inline status toggle (New / Contacted / Closed) with optimistic UI
- Real authentication — NextAuth Credentials provider, JWT sessions, admin
  password stored as a bcrypt hash in an environment variable (never a
  hardcoded string, never plaintext)
- `/admin` and its sub-routes are protected by middleware; unauthenticated
  visitors are redirected to `/admin/login`

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL ·
`pg` (parameterized SQL, no ORM) · NextAuth · bcryptjs · Zod

## Data model

One table, `leads`:

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | varchar(160) | |
| email | varchar(255) | |
| budget_range | varchar(60) | one of `<$1k`, `$1k-$5k`, `$5k-$20k`, `$20k+` |
| message | text | |
| status | varchar(20) | `New` / `Contacted` / `Closed`, DB-level CHECK constraint |
| created_at | timestamp | |

Kept deliberately to one table — the task is a lead-capture tool, not a
CRM, and a single well-indexed table (on `status` and `created_at`) is the
honest scope for it.

## Auth approach

Admin login uses NextAuth's Credentials provider. The admin identity is
**not** a hardcoded string comparison — the email and a bcrypt **hash** of
the password live in environment variables (`ADMIN_EMAIL`,
`ADMIN_PASSWORD_HASH`), and `authorize()` compares the submitted password
against the hash with `bcrypt.compare`. Sessions are signed JWTs managed
entirely by NextAuth (8-hour expiry) — no session state stored in the app.
`middleware.ts` protects every `/admin/*` route except the login page
itself.

## Quick start

### 1. Get a Postgres database

Any free-tier hosted Postgres works — [Supabase](https://supabase.com) or
[Neon](https://neon.tech) are the fastest to set up (a few minutes, no
credit card). Create a project, then copy the connection string.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` — your Postgres connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev
- `ADMIN_EMAIL` — the email you'll log in with
- `ADMIN_PASSWORD_HASH` — generate with:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
  ```

### 3. Install and initialize the database

```bash
npm install
npm run db:init   # creates the leads table
```

### 4. Run it

```bash
npm run dev
# App: http://localhost:3000
# Admin: http://localhost:3000/admin (redirects to /admin/login first)
```

## Deployment (Vercel)

1. Push to GitHub, import the repo on Vercel
2. Set the same environment variables from `.env.example` in Vercel's
   project settings (use your production `NEXTAUTH_URL` — your actual
   Vercel domain)
3. Deploy — `npm run db:init` needs to be run once against your production
   database before first use (run it locally with `DATABASE_URL` pointed
   at production, or via your DB provider's SQL console using
   `scripts/init-db.sql` directly)

## License

MIT
