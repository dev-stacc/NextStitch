import { json } from '@/src/server/http'

// TODO(stub): wire to real LLM (Anthropic Claude) — suggest a fabric search
// query based on the project's patterns and description.
export async function POST() {
  return json('lightweight cotton lawn')
}
