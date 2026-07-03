import { NextRequest } from 'next/server'
import type { PatternSearchHit, PatternSource } from '@/src/domain'
import { badRequest, json } from '@/src/server/http'

interface Body {
  query: string
  source: PatternSource
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body
  if (!body?.query?.trim() || !body?.source) return badRequest('query and source required')

  const q = body.query.trim()
  const hits: PatternSearchHit[] = Array.from({ length: 3 }).map((_, i) => ({
    source: body.source,
    title: `${q} — ${body.source.replace(/_/g, ' ')} #${i + 1}`,
    url: `https://example.com/${body.source}/${encodeURIComponent(q)}/${i + 1}`,
    image_url: `https://picsum.photos/seed/${body.source}-${i}/240/240`,
    price: `$${(9.99 + i * 4).toFixed(2)}`,
    pattern_number: `${body.source.slice(0, 2).toUpperCase()}-${1000 + i}`,
  }))

  return json(hits)
}
