import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/src/server/auth-helpers'
import { badRequest, json } from '@/src/server/http'
import { getMaterialScraper } from '@/src/server/services/materials'

interface Body {
  query: string
  source: string
}

export async function POST(req: NextRequest) {
  const userId = await requireUser()
  if (userId instanceof NextResponse) return userId

  const body = (await req.json()) as Body
  if (!body?.query?.trim() || !body?.source) return badRequest('query and source required')

  const scraper = getMaterialScraper(body.source)
  if (!scraper) return json([])

  try {
    const hits = await scraper.search(body.query.trim())
    return json(hits)
  } catch {
    return json([])
  }
}
