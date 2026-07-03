import type { NextAuthConfig } from 'next-auth'

// Edge-safe subset of the auth config. The middleware runs on the edge runtime
// and can't pull in the Drizzle adapter or bcryptjs, so we split those into
// `auth.ts` and keep only the providers-agnostic shell here.
export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub
      return session
    },
  },
} satisfies NextAuthConfig

export default authConfig
