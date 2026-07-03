import { NextRequest } from 'next/server'
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
  const url = await fileToDataUrl(file)
  return json({ url })
}
