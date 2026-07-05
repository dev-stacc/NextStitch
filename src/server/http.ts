import { type NextRequest, NextResponse } from 'next/server'

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

export async function readJson<T>(req: NextRequest): Promise<{ ok: true; data: T } | { ok: false; res: NextResponse }> {
  try {
    return { ok: true, data: (await req.json()) as T }
  } catch {
    return { ok: false, res: badRequest('Invalid JSON body') }
  }
}

export async function readFormData(req: NextRequest): Promise<{ ok: true; data: FormData } | { ok: false; res: NextResponse }> {
  try {
    return { ok: true, data: await req.formData() }
  } catch {
    return { ok: false, res: badRequest('Invalid form data') }
  }
}

export function parseIntParam(value: string | undefined): number | null {
  if (value == null) return null
  const n = Number(value)
  return Number.isFinite(n) && Number.isInteger(n) ? n : null
}
