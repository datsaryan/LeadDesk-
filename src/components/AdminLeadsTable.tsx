'use client'

import { useEffect, useState } from 'react'

interface Lead {
  id: number
  name: string
  email: string
  budget_range: string
  message: string
  status: 'New' | 'Contacted' | 'Closed'
  created_at: string
}

type LoadState = 'loading' | 'error' | 'ready'

const STATUS_STYLES: Record<Lead['status'], string> = {
  New: 'bg-blue-50 text-blue-700',
  Contacted: 'bg-amber-50 text-amber-700',
  Closed: 'bg-neutral-100 text-neutral-500',
}

export function AdminLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  async function load() {
    setState('loading')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/leads?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load leads')
      const data = await res.json()
      setLeads(data)
      setState('ready')
    } catch {
      setErrorMsg('Could not load leads. Please try again.')
      setState('error')
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300) // debounced search, per standard search UX
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter])

  async function updateStatus(id: number, status: Lead['status']) {
    setUpdatingId(id)
    const previous = leads
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update failed')
    } catch {
      setLeads(previous) // roll back on failure
      setErrorMsg('Could not update status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-64 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">All statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {errorMsg && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </p>
      )}

      {state === 'loading' && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md border border-neutral-200 bg-white" />
          ))}
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Something went wrong loading leads.{' '}
          <button onClick={load} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      {state === 'ready' && leads.length === 0 && (
        <div className="rounded-md border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          {search || statusFilter ? 'No leads match your filters.' : 'No leads yet — they\u2019ll show up here once submitted.'}
        </div>
      )}

      {state === 'ready' && leads.length > 0 && (
        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-2.5 font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 font-medium text-neutral-500">Email</th>
                <th className="px-4 py-2.5 font-medium text-neutral-500">Budget</th>
                <th className="px-4 py-2.5 font-medium text-neutral-500">Message</th>
                <th className="px-4 py-2.5 font-medium text-neutral-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-900">{lead.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{lead.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{lead.budget_range}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-neutral-500" title={lead.message}>
                    {lead.message}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) => updateStatus(lead.id, e.target.value as Lead['status'])}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${STATUS_STYLES[lead.status]}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
