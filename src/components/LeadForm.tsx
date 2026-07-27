'use client'

import { FormEvent, useState } from 'react'

const BUDGET_OPTIONS = ['<$1k', '$1k-$5k', '$5k-$20k', '$20k+'] as const

export function LeadForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setFieldErrors({})
    setErrorMsg(null)

    // Lightweight client-side pass — the server re-validates everything with
    // the same rules, since the browser can never be trusted alone.
    const clientErrors: Record<string, string> = {}
    if (!name.trim()) clientErrors.name = 'Name is required'
    if (!/^\S+@\S+\.\S+$/.test(email)) clientErrors.email = 'Enter a valid email address'
    if (!budgetRange) clientErrors.budgetRange = 'Select a budget range'
    if (message.trim().length < 10) clientErrors.message = 'Please add a bit more detail'

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      setStatus('idle')
      return
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, budgetRange, message }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.fieldErrors) setFieldErrors(data.fieldErrors)
        setErrorMsg(data.message ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setStatus('success')
      setName('')
      setEmail('')
      setBudgetRange('')
      setMessage('')
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="rounded-card border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">Thanks — we&rsquo;ve got your message.</p>
        <p className="mt-1 text-sm text-green-700">We&rsquo;ll be in touch shortly.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-green-800 underline"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700">
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="Jordan Lee"
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="jordan@company.com"
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="budgetRange" className="mb-1.5 block text-sm font-medium text-neutral-700">
          Budget range
        </label>
        <select
          id="budgetRange"
          value={budgetRange}
          onChange={(e) => setBudgetRange(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Select a range…</option>
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {fieldErrors.budgetRange && <p className="mt-1 text-xs text-red-600">{fieldErrors.budgetRange}</p>}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-neutral-700">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="Tell us a bit about what you're looking for…"
        />
        {fieldErrors.message && <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>}
      </div>

      {errorMsg && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
