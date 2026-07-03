import { NextRequest } from 'next/server'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

interface Body {
  prompt: string
  measurements: Record<string, number | null>
}

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()

  const body = (await req.json()) as Body
  if (!body?.prompt?.trim()) return badRequest('prompt is required')

  // TODO(stub): wire to real Claude-driven pattern generator + PDF renderer.
  // For now, create a placeholder "generated" pattern with a data-url PDF stub.
  const pdfStub =
    'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCnRyYWlsZXIKPDwKL1Jvb3QgMSAwIFIKPj4KJSVFT0Y='

  const pattern = await getStore().patterns.create(projectId, {
    source: 'generated',
    title: `Generated: ${body.prompt.slice(0, 60)}`,
    url: pdfStub,
    image_url: null,
    price: null,
  })
  if (!pattern) return notFound()
  getEventBus().notify(projectId)
  return json([pattern], 201)
}
