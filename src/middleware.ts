import { withAuth } from 'next-auth/middleware'

// Protects /admin and its sub-routes (except /admin/login, excluded below).
// Unauthenticated requests are redirected to the login page by next-auth's
// withAuth wrapper automatically.
export default withAuth({
  pages: { signIn: '/admin/login' },
})

export const config = {
  matcher: ['/admin/((?!login).*)'],
}
