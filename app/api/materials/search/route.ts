import { NextRequest } from 'next/server'
import type { MaterialSearchHit } from '@/src/domain'
import { badRequest, json } from '@/src/server/http'

interface Body {
  query: string
  source: string
}

// TODO(stub): replace with real fabric-store scrapers (fabricville, tonitex,
// spool_of_thread, fine_fabrics_canada, the_fabric_club, cleanersupply).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body
  if (!body?.query?.trim() || !body?.source) return badRequest('query and source required')

  const q = body.query.trim()
  const hits: MaterialSearchHit[] = Array.from({ length: 3 }).map((_, i) => ({
    source: body.source,
    title: `${q} — ${body.source.replace(/_/g, ' ')} pick ${i + 1}`,
    url: `https://example.com/${body.source}/${encodeURIComponent(q)}/${i + 1}`,
    image_url: `https://picsum.photos/seed/${body.source}-mat-${i}/240/240`,
    price: `$${(6.99 + i * 3).toFixed(2)} / yd`,
  }))

  return json(hits)
}
