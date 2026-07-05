import Anthropic from '@anthropic-ai/sdk'
import type { PatternSpec } from './types'

const MODEL = 'claude-haiku-4-5'
const MAX_TOKENS = 2048

const SYSTEM = `You are a sewing pattern drafting assistant. Given body measurements and a garment description, return ONLY a valid JSON object — no markdown fences, no explanation.

Allowed shapes: "rectangle", "trapezoid" (symmetric), "right_triangle"
Dimensions per shape:
  rectangle      → { "width_cm": N, "height_cm": N }
  trapezoid      → { "top_cm": N, "bottom_cm": N, "height_cm": N }
  right_triangle → { "leg1_cm": N, "leg2_cm": N }

All dimensions are FINISHED (no seam allowance — the system adds 1.5 cm to all edges).
Add appropriate ease: 2–4 cm for fitted, 4–8 cm for relaxed, more for loose/gathered.

Output schema:
{
  "title": "string",
  "instructions": ["step 1", "step 2"],
  "pieces": [
    {
      "name": "string",
      "shape": "rectangle|trapezoid|right_triangle",
      "dimensions": { ... },
      "cut_count": 1,
      "on_fold": false,
      "grain": "straight|bias|cross",
      "notes": "optional string"
    }
  ]
}`

let cached: Anthropic | null = null

function client(): Anthropic {
  if (!cached) cached = new Anthropic()
  return cached
}

function stripFences(raw: string): string {
  let s = raw.trim()
  if (!s.startsWith('```')) return s
  s = s.slice(3)
  if (s.toLowerCase().startsWith('json')) s = s.slice(4)
  const end = s.lastIndexOf('```')
  if (end >= 0) s = s.slice(0, end)
  return s.trim()
}

export async function generatePatternSpec(
  prompt: string,
  measurements: Record<string, number | null>,
): Promise<PatternSpec> {
  const filled = Object.entries(measurements).filter(([, v]) => v != null)
  const measStr = filled.length
    ? filled.map(([k, v]) => `${k}=${v} cm`).join(', ')
    : 'no measurements provided'
  const userMsg = `Measurements: ${measStr}\nGarment: ${prompt}`

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
  })
  const first = res.content[0]
  const raw = first?.type === 'text' ? first.text : ''
  const spec = JSON.parse(stripFences(raw)) as PatternSpec
  if (!Array.isArray(spec.pieces)) throw new Error("Claude response missing 'pieces' list")
  return spec
}
