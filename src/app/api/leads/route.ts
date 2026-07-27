import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool } from '@/lib/db'
import { leadSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic' // always hits the DB, never statically cached

// POST /api/leads — public endpoint, the landing-page form submits here.
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    // Server-side validation mirrors the client — never trust the browser alone.
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message
    }
    return NextResponse.json({ message: 'Validation failed', fieldErrors }, { status: 400 })
  }

  const { name, email, budgetRange, message } = parsed.data

  try {
    const result = await pool.query(
      `INSERT INTO leads (name, email, budget_range, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, budget_range, message, status, created_at`,
      [name, email, budgetRange, message]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    console.error('Failed to create lead:', err)
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// GET /api/leads — admin-only, lists leads with optional search + status filter.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const search = searchParams.get('search')?.trim() ?? ''
  const status = searchParams.get('status')?.trim() ?? ''

  const conditions: string[] = []
  const values: string[] = []

  if (search) {
    values.push(`%${search}%`)
    conditions.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length})`)
  }
  if (status && ['New', 'Contacted', 'Closed'].includes(status)) {
    values.push(status)
    conditions.push(`status = $${values.length}`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const result = await pool.query(
      `SELECT id, name, email, budget_range, message, status, created_at
       FROM leads
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 200`,
      values
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('Failed to list leads:', err)
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
