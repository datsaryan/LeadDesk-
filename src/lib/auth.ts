import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Auth is env-var driven, not a hardcoded string check: the admin email and
// a bcrypt password HASH (never the plaintext password) live in
// ADMIN_EMAIL / ADMIN_PASSWORD_HASH. Session is a signed JWT managed by
// NextAuth — no session state stored in the app itself.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

        if (!adminEmail || !adminPasswordHash) {
          console.error('ADMIN_EMAIL / ADMIN_PASSWORD_HASH not configured')
          return null
        }

        if (credentials.email.toLowerCase() !== adminEmail.toLowerCase()) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, adminPasswordHash)
        if (!isValid) return null

        return { id: 'admin', email: adminEmail, name: 'Admin' }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 }, // 8-hour session
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
}
