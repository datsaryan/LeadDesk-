import { AdminLeadsTable } from '@/components/AdminLeadsTable'
import { Footer } from '@/components/Footer'
import { SignOutButton } from '@/components/SignOutButton'

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
            LeadDesk Mini — Admin
          </span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-neutral-900">Leads</h1>
        <AdminLeadsTable />
      </main>
      <Footer />
    </div>
  )
}
