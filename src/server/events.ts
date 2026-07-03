type Listener = (projectId: number) => void

class ProjectEventBus {
  private readonly listeners = new Set<Listener>()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify(projectId: number): void {
    for (const listener of this.listeners) listener(projectId)
  }
}

const globalKey = Symbol.for('next-stitch.eventBus')
type WithBus = typeof globalThis & { [key: symbol]: ProjectEventBus | undefined }

export function getEventBus(): ProjectEventBus {
  const g = globalThis as WithBus
  if (!g[globalKey]) g[globalKey] = new ProjectEventBus()
  return g[globalKey]!
}
