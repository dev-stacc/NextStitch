import { NextRequest, NextResponse } from 'next/server'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { badRequest, json , readFormData } from '@/src/server/http'
import { fileToDataUrl, validateImage } from '@/src/server/uploads'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const formResult = await readFormData(req)
  if (!formResult.ok) return formResult.res
  const form = formResult.data
  const file = form.get('file')
  if (!(file instanceof File)) return badRequest('file is required')
  const check = validateImage(file)
  if (!check.ok) return badRequest(check.error)
  const url = await fileToDataUrl(file)
  return json({ url })
}
