export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'HttpError'
  }
}

export interface RequestOptions {
  signal?: AbortSignal
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.clone().json()) as { detail?: string }
    if (data.detail) return data.detail
  } catch {}
  return `Error ${res.status}`
}

export async function requestJson<T>(
  input: string,
  init?: RequestInit & RequestOptions,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) throw new HttpError(res.status, await parseError(res))
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function requestForm<T>(
  input: string,
  form: FormData,
  init?: RequestOptions,
): Promise<T> {
  const res = await fetch(input, { method: 'POST', body: form, signal: init?.signal })
  if (!res.ok) throw new HttpError(res.status, await parseError(res))
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function requestVoid(input: string, init?: RequestInit): Promise<void> {
  const res = await fetch(input, init)
  if (!res.ok) throw new HttpError(res.status, await parseError(res))
}
