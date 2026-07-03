import type { FabricStore } from '@/src/models'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const USER_AGENT = 'SewingAssistant/1.0 (next-stitch store finder)'

interface OverpassTags {
  name?: string
  phone?: string
  website?: string
  opening_hours?: string
  'addr:housenumber'?: string
  'addr:street'?: string
  'addr:city'?: string
  'addr:postcode'?: string
}

interface OverpassElement {
  lat?: number
  lon?: number
  tags?: OverpassTags
}

interface OverpassResponse {
  elements?: OverpassElement[]
}

function buildAddress(tags: OverpassTags): string {
  const parts = [
    tags['addr:housenumber'] ?? '',
    tags['addr:street'] ?? '',
    tags['addr:city'] ?? '',
    tags['addr:postcode'] ?? '',
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Address not available'
}

function buildQuery(lat: number, lon: number, radiusM: number): string {
  return `[out:json][timeout:25];
(
  node["shop"="fabric"](around:${radiusM},${lat},${lon});
  node["shop"="haberdashery"](around:${radiusM},${lat},${lon});
);
out body;`
}

export async function findNearbyFabricStores(
  lat: number,
  lon: number,
  radiusM = 10_000,
): Promise<FabricStore[]> {
  const body = new URLSearchParams({ data: buildQuery(lat, lon, radiusM) })
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) return []
  const data = (await res.json()) as OverpassResponse
  const elements = data.elements ?? []
  return elements
    .filter((el): el is OverpassElement & { lat: number; lon: number } =>
      typeof el.lat === 'number' && typeof el.lon === 'number',
    )
    .map((el) => {
      const tags = el.tags ?? {}
      return {
        name: tags.name ?? 'Unnamed store',
        address: buildAddress(tags),
        lat: el.lat,
        lon: el.lon,
        phone: tags.phone ?? null,
        website: tags.website ?? null,
        opening_hours: tags.opening_hours ?? null,
      }
    })
}
