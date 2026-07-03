import type {
  CreatePatternInput,
  Pattern,
  PatternSearchHit,
  PatternSource,
  UpdatePatternInput,
} from '@/src/domain'
import { requestForm, requestJson, requestVoid } from './http'

export interface PatternUploadInput {
  file: File
  title: string
  notes: string
  price_paid?: string
}

export interface GenerateAiInput {
  prompt: string
  measurements: Record<string, number | null>
}

export interface PatternsApi {
  search(source: PatternSource, query: string): Promise<PatternSearchHit[]>
  create(projectId: number | string, input: CreatePatternInput): Promise<Pattern>
  update(projectId: number | string, patternId: number, input: UpdatePatternInput): Promise<Pattern>
  remove(projectId: number | string, patternId: number): Promise<void>
  upload(projectId: number | string, input: PatternUploadInput): Promise<Pattern>
  generateAi(projectId: number | string, input: GenerateAiInput): Promise<Pattern[]>
}

export const patternsApi: PatternsApi = {
  search: (source, query) =>
    requestJson<PatternSearchHit[]>('/api/patterns/search', {
      method: 'POST',
      body: JSON.stringify({ query, source }),
    }),
  create: (projectId, input) =>
    requestJson<Pattern>(`/api/projects/${projectId}/patterns`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (projectId, patternId, input) =>
    requestJson<Pattern>(`/api/projects/${projectId}/patterns/${patternId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  remove: (projectId, patternId) =>
    requestVoid(`/api/projects/${projectId}/patterns/${patternId}`, { method: 'DELETE' }),
  upload: (projectId, { file, title, notes, price_paid }) => {
    const form = new FormData()
    form.append('file', file)
    form.append('title', title)
    form.append('notes', notes)
    if (price_paid) form.append('price_paid', price_paid)
    return requestForm<Pattern>(`/api/projects/${projectId}/patterns/upload`, form)
  },
  generateAi: (projectId, input) =>
    requestJson<Pattern[]>(`/api/projects/${projectId}/patterns/generate-ai`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
