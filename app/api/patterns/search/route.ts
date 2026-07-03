import { NextRequest, NextResponse } from 'next/server'
import type { PatternSource } from '@/src/models'
import { requireUser } from '@/src/server/auth-helpers'
import { badRequest, json } from '@/src/server/http'
import { getPatternScraper } from '@/src/server/services/patterns'

interface Body {
  query: string
  source: PatternSource
}

export async function POST(req: NextRequest) {
  const userId = await requireUser()
  if (userId instanceof NextResponse) return userId

  const body = (await req.json()) as Body
  if (!body?.query?.trim() || !body?.source) return badRequest('query and source required')

  const scraper = getPatternScraper(body.source)
  if (!scraper) return json([])

  try {
    const hits = await scraper.search(body.query.trim())
    return json(hits)
  } catch {
    return json([])
  }
}
