export interface GeocodeResult {
  lat: number
  lon: number
}

export async function geocodeCity(city: string): Promise<GeocodeResult> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en' } },
  )
  const data = (await res.json()) as Array<{ lat: string; lon: string }>
  if (!data.length) throw new Error(`City "${city}" not found.`)
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}
