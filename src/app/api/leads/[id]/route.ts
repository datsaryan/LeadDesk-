import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool } from '@/lib/db'
import { statusSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// PATCH /api/leads/:id — admin-only status toggle (New / Contacted / Closed).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ message: 'Invalid lead id.' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid status value.' }, { status: 400 })
  }

  try {
    const result = await pool.query(
      `UPDATE leads SET status = $1 WHERE id = $2
       RETURNING id, name, email, budget_range, message, status, created_at`,
      [parsed.data.status, id]
    )
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Lead not found.' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error('Failed to update lead status:', err)
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
