'use client'

import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { FabricStore } from '@/src/domain'
import { configureLeafletIcons } from './leaflet-icons'

interface Props {
  center: [number, number]
  initialCenter: [number, number]
  stores: FabricStore[]
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, 12)
  }, [center, map])
  return null
}

export default function StoresMap({ center, initialCenter, stores }: Props) {
  useEffect(() => {
    configureLeafletIcons()
  }, [])

  return (
    <MapContainer center={initialCenter} zoom={12} className="w-full h-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Recenter center={center} />
      {stores.map((store, i) =>
        store.lat && store.lon ? (
          <Marker key={i} position={[store.lat, store.lon]}>
            <Popup>
              <strong>{store.name}</strong>
              {store.address && store.address !== 'Address not available' && (
                <>
                  <br />
                  {store.address}
                </>
              )}
            </Popup>
          </Marker>
        ) : null,
      )}
    </MapContainer>
  )
}
