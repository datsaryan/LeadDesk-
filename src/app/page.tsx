import { LeadForm } from '@/components/LeadForm'
import { Footer } from '@/components/Footer'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              LeadDesk Mini
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Tell us about your project and we&rsquo;ll get back to you.
            </p>
          </div>
          <div className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
            <LeadForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
