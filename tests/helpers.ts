import { NextRequest } from 'next/server'

type Params = Record<string, string>

interface JsonInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

export function jsonRequest(url: string, init: JsonInit = {}): NextRequest {
  const method = init.method ?? 'GET'
  const hasBody = init.body !== undefined
  return new NextRequest(new URL(url, 'http://test.local'), {
    method,
    body: hasBody ? JSON.stringify(init.body) : undefined,
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
  })
}

export function formRequest(url: string, form: FormData): NextRequest {
  return new NextRequest(new URL(url, 'http://test.local'), {
    method: 'POST',
    body: form,
  })
}

export function ctx<T extends Params>(params: T): { params: Promise<T> } {
  return { params: Promise.resolve(params) }
}
