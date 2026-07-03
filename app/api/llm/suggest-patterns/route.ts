import { json } from '@/src/server/http'

// TODO(stub): wire to real LLM (Anthropic Claude) — suggest a pattern search
// query based on the project's description and materials.
export async function POST() {
  return json('flowy summer dress')
}
