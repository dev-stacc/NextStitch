import type { Material } from '@/src/domain'

export function extractSourceUrl(notes: string | null | undefined): string | null {
  const m = notes?.match(/https?:\/\/[^\s]+/)
  return m?.[0] ?? null
}

export function isScrapedMaterial(material: Material): boolean {
  return extractSourceUrl(material.notes) !== null
}
