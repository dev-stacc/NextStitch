'use client'

import { useCallback, useEffect, useState } from 'react'
import { projectsApi } from '@/src/api'
import type { ProjectDetail } from '@/src/domain'
import { useProjectEvents } from './useProjectEvents'

interface State {
  project: ProjectDetail | null
  loading: boolean
  error: string | null
}

export function useProject(id: number | string) {
  const [state, setState] = useState<State>({ project: null, loading: true, error: null })

  const refresh = useCallback(() => {
    projectsApi
      .get(id)
      .then((project) => setState({ project, loading: false, error: null }))
      .catch((err: Error) => setState({ project: null, loading: false, error: err.message }))
  }, [id])

  useEffect(() => {
    refresh()
  }, [refresh])

  useProjectEvents(id, refresh)

  return { ...state, refresh, setProject: (p: ProjectDetail | null) => setState((s) => ({ ...s, project: p })) }
}
