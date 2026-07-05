import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-haiku-4-5'
const MAX_TOKENS = 16

const PATTERN_SYSTEM =
  'You are a sewing expert. Given a project name and description, ' +
  'reply with ONLY a single search query of 1-3 words for finding sewing patterns. ' +
  'No prose, no punctuation, just the query. Example: Victorian dress'

const MATERIAL_SYSTEM =
  'You are a sewing expert. Given a project name and description, ' +
  'reply with ONLY a single 1-word fabric or notion name to search for. ' +
  'No prose, no punctuation, just the word. Example: taffeta'

let cached: Anthropic | null = null

function client(): Anthropic {
  if (!cached) cached = new Anthropic()
  return cached
}

async function suggest(system: string, name: string, description: string | null): Promise<string> {
  const userMsg = `Project: ${name}\nDescription: ${description ?? 'No description provided.'}`
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: 'user', content: userMsg }],
  })
  const first = res.content[0]
  return first?.type === 'text' ? first.text.trim() : ''
}

export function suggestPatterns(name: string, description: string | null): Promise<string> {
  return suggest(PATTERN_SYSTEM, name, description)
}

export function suggestMaterials(name: string, description: string | null): Promise<string> {
  return suggest(MATERIAL_SYSTEM, name, description)
}
