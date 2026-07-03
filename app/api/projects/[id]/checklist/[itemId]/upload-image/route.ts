import { NextRequest } from 'next/server'
import { badRequest, json, notFound, parseIntParam } from '@/src/server/http'
import { fileToDataUrl } from '@/src/server/uploads'

type Params = { params: Promise<{ id: string; itemId: string }> }

export async function POST(req: NextRequest, ctx: Params) {
  const { id, itemId } = await ctx.params
  const projectId = parseIntParam(id)
  const iid = parseIntParam(itemId)
  if (projectId == null || iid == null) return notFound()
  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return badRequest('file is required')
  const url = await fileToDataUrl(file)
  return json({ url })
}
