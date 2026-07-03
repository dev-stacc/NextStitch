import { NextResponse } from 'next/server'

export function json<T>(data: T, init?: number | ResponseInit): NextResponse {
  return NextResponse.json(data, typeof init === 'number' ? { status: init } : init)
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function notFound(detail = 'Not found'): NextResponse {
  return NextResponse.json({ detail }, { status: 404 })
}

export function badRequest(detail = 'Bad request'): NextResponse {
  return NextResponse.json({ detail }, { status: 400 })
}

export function unauthorized(detail = 'Unauthorized'): NextResponse {
  return NextResponse.json({ detail }, { status: 401 })
}

export function parseIntParam(value: string | undefined): number | null {
  if (value == null) return null
  const n = Number(value)
  return Number.isFinite(n) && Number.isInteger(n) ? n : null
}
