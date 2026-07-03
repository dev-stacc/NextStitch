import { requestJson } from './http'

export interface LlmApi {
  suggestPatterns(projectId: number): Promise<string>
  suggestMaterials(projectId: number): Promise<string>
}

export const llmApi: LlmApi = {
  suggestPatterns: (projectId) =>
    requestJson<string>('/api/llm/suggest-patterns', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    }),
  suggestMaterials: (projectId) =>
    requestJson<string>('/api/llm/suggest-materials', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    }),
}
