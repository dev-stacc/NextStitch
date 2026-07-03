import type { NextResponse } from 'next/server'
import { getStore } from './db'
import { notFound, parseIntParam, unauthorized } from './http'

// Test-only override — kept out of the production path via the VITEST env check below.
let overrideUserId: string | null = null

export function setTestUserIdForTests(userId: string | null): void {
  overrideUserId = userId
}

export async function getCurrentUserId(): Promise<string | null> {
  if (process.env.VITEST) return overrideUserId
  // Lazily import auth so tests never load NextAuth (which needs DATABASE_URL).
  const { auth } = await import('./auth')
  const session = await auth()
  return session?.user?.id ?? null
}

/** Returns the current user id or a 401 NextResponse — call from route handlers. */
export async function requireUser(): Promise<string | NextResponse> {
  const userId = await getCurrentUserId()
  return userId ?? unauthorized()
}

/**
 * Gate for handlers that touch a project's children (patterns, materials, …).
 * Returns { userId, projectId } if the current user owns the project, or a
 * 401/404 NextResponse otherwise.
 */
export async function requireProjectAccess(
  idParam: string | undefined,
): Promise<{ userId: string; projectId: number } | NextResponse> {
  const userId = await getCurrentUserId()
  if (!userId) return unauthorized()
  const projectId = parseIntParam(idParam)
  if (projectId == null) return notFound()
  const project = await getStore().projects.get(userId, projectId)
  if (!project) return notFound()
  return { userId, projectId }
}
