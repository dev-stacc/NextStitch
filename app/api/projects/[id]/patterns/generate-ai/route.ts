import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound } from '@/src/server/http'

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

  // TODO(stub): replace with Claude-driven pattern generator + PDF renderer.
  const pdfStub =
    'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCnRyYWlsZXIKPDwKL1Jvb3QgMSAwIFIKPj4KJSVFT0Y='

  const pattern = await getStore().patterns.create(access.projectId, {
    source: 'generated',
    title: `Generated: ${body.prompt.slice(0, 60)}`,
    url: pdfStub,
    image_url: null,
    price: null,
  })
  if (!pattern) return notFound()
  getEventBus().notify(access.projectId)
  return json([pattern], 201)
}
