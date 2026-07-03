'use client'

import { useEffect } from 'react'

export function useProjectEvents(
  projectId: number | string,
  onChange: () => void,
): void {
  useEffect(() => {
    const es = new EventSource(`/api/projects/${projectId}/events`)
    es.onmessage = () => onChange()
    es.onerror = () => {}
    return () => es.close()
  }, [projectId, onChange])
}
