import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/src/server/auth.config'

const { auth } = NextAuth(authConfig)

const PUBLIC_PATHS = new Set(['/login', '/signup'])

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/api/auth')) return
  if (!req.auth) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
})

export const config = {
  // Everything except Next internals, static assets, the auth handler routes,
  // and the SSE event stream (SSE + middleware fight over the response body).
  matcher: [
    '/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/auth|api/projects/\\d+/events).*)',
  ],
}
