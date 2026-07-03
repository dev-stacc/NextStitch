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

// SSE event stream is excluded — middleware wrapping breaks streaming responses.
export const config = {
  matcher: [
    '/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/auth|api/projects/\\d+/events).*)',
  ],
}
