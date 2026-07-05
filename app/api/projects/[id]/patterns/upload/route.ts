import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound } from '@/src/server/http'
import { fileToDataUrl, validatePattern } from '@/src/server/uploads'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return badRequest('file is required')
  const check = validatePattern(file)
  if (!check.ok) return badRequest(check.error)

  const title = String(form.get('title') ?? '').trim() || file.name
  const notes = String(form.get('notes') ?? '')
  const pricePaidRaw = form.get('price_paid')
  const price_paid = pricePaidRaw ? Number(pricePaidRaw) : null

  const url = await fileToDataUrl(file)
  const pattern = await getStore().patterns.create(access.projectId, {
    source: 'upload',
    title,
    url,
    image_url: null,
    price: null,
    price_paid: Number.isFinite(price_paid) ? price_paid : null,
    notes,
  })
  if (!pattern) return notFound()
  getEventBus().notify(access.projectId)
  return json(pattern, 201)
}
