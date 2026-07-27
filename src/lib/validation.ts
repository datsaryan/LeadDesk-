import { z } from 'zod'

// Shared schema — used for both client-side and server-side validation so
// the browser and the API reject exactly the same bad input.
export const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: z.string().trim().email('Enter a valid email address').max(255),
  budgetRange: z.enum(['<$1k', '$1k-$5k', '$5k-$20k', '$20k+'], {
    errorMap: () => ({ message: 'Select a budget range' }),
  }),
  message: z.string().trim().min(10, 'Please add a bit more detail').max(2000),
})

export type LeadInput = z.infer<typeof leadSchema>

export const statusSchema = z.object({
  status: z.enum(['New', 'Contacted', 'Closed']),
})
