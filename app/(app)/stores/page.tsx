'use client'

import { type FormEvent, useState } from 'react'
import dynamic from 'next/dynamic'
import { storesApi } from '@/src/api'
import type { FabricStore } from '@/src/models'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'
import StoreCard from '@/src/components/stores/StoreCard'
import { geocodeCity } from '@/src/components/stores/geocode'

const StoresMap = dynamic(() => import('@/src/components/stores/StoresMap'), { ssr: false })

const MONTREAL: [number, number] = [45.5017, -73.5673]

export default function StoresPage() {
  const [city, setCity] = useState('Montreal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stores, setStores] = useState<FabricStore[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>(MONTREAL)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!city.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { lat, lon } = await geocodeCity(city)
      setMapCenter([lat, lon])
      const { stores } = await storesApi.nearby({ lat, lon, radius_m: 10_000 })
      setStores(stores)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <div className="flex flex-col md:h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-semibold">Find Fabric Stores</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 shrink-0">
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="City name…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !city.trim()}>
          {loading ? <Spinner size="sm" /> : 'Search'}
        </button>
      </form>

      {error && <Alert className="shrink-0">{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:flex-1 md:min-h-0">
        <div className="bg-base-200 rounded-xl p-4 flex flex-col md:min-h-0 order-2 md:order-1">
          <p className="text-sm text-base-content/50 mb-3 shrink-0">
            {!searched
              ? 'Search a city to find nearby fabric & sewing stores.'
              : stores.length > 0
                ? `${stores.length} store${stores.length !== 1 ? 's' : ''} found within 10 km`
                : 'No stores found in this area.'}
          </p>
          <div className="md:flex-1 md:min-h-0 overflow-y-auto space-y-2 pr-1">
            {stores.map((store, i) => (
              <StoreCard key={i} store={store} />
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden h-72 md:h-auto order-1 md:order-2">
          <StoresMap center={mapCenter} initialCenter={MONTREAL} stores={stores} />
        </div>
      </div>
    </div>
  )
}
