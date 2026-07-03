import { NextRequest } from 'next/server'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound, parseIntParam } from '@/src/server/http'
import { fileToDataUrl } from '@/src/server/uploads'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return badRequest('file is required')

  const title = String(form.get('title') ?? '').trim() || file.name
  const notes = String(form.get('notes') ?? '')
  const pricePaidRaw = form.get('price_paid')
  const price_paid = pricePaidRaw ? Number(pricePaidRaw) : null

  const url = await fileToDataUrl(file)
  const pattern = await getStore().patterns.create(projectId, {
    source: 'upload',
    title,
    url,
    image_url: null,
    price: null,
    price_paid: Number.isFinite(price_paid) ? price_paid : null,
    notes,
  })
  if (!pattern) return notFound()
  getEventBus().notify(projectId)
  return json(pattern, 201)
}
