import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound } from '@/src/server/http'
import { generatePatternSpec, renderPatternPdf } from '@/src/server/services/pattern-gen'

type Params = { params: Promise<{ id: string }> }

interface Body {
  prompt: string
  measurements: Record<string, number | null>
}

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access

  const body = (await req.json()) as Body
  if (!body?.prompt?.trim()) return badRequest('prompt is required')

  let spec, pdf
  try {
    spec = await generatePatternSpec(body.prompt, body.measurements ?? {})
    pdf = await renderPatternPdf(spec)
  } catch (err) {
    return NextResponse.json({ detail: (err as Error).message }, { status: 502 })
  }

  const dataUrl = `data:application/pdf;base64,${pdf.toString('base64')}`
  const pattern = await getStore().patterns.create(access.projectId, {
    source: 'generated',
    title: spec.title || `Generated: ${body.prompt.slice(0, 60)}`,
    url: dataUrl,
    image_url: null,
    price: null,
  })
  if (!pattern) return notFound()
  getEventBus().notify(access.projectId)
  return json([pattern], 201)
}
