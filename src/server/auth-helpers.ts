import type { NextResponse } from 'next/server'
import { getStore } from './db'
import { notFound, parseIntParam, unauthorized } from './http'

let overrideUserId: string | null = null

export function setTestUserIdForTests(userId: string | null): void {
  overrideUserId = userId
}

export async function getCurrentUserId(): Promise<string | null> {
  if (process.env.VITEST) return overrideUserId
  // Lazy import: pulls in Drizzle + bcryptjs, which tests must not load.
  const { auth } = await import('./auth')
  const session = await auth()
  return session?.user?.id ?? null
}

export async function requireUser(): Promise<string | NextResponse> {
  const userId = await getCurrentUserId()
  return userId ?? unauthorized()
}

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
