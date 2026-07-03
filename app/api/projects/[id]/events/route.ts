import { NextRequest, NextResponse } from 'next/server'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const projectId = access.projectId

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
        try {
          controller.close()
        } catch {
          /* already closed */
        }
      }
      req.signal.addEventListener('abort', close)
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
