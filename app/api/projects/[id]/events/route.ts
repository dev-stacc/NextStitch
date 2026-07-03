import { NextRequest } from 'next/server'
import { getEventBus } from '@/src/server/events'
import { parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return new Response('not found', { status: 404 })

  const encoder = new TextEncoder()
  const bus = getEventBus()

  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = bus.subscribe((changed) => {
        if (changed === projectId) {
          controller.enqueue(encoder.encode(`data: {"changed":${changed}}\n\n`))
        }
      })
      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'))
      }, 25_000)
      const close = () => {
        clearInterval(ping)
        unsubscribe()
        try { controller.close() } catch { /* already closed */ }
      }
      _req.signal.addEventListener('abort', close)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
