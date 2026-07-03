import { Clock, Globe, MapPin, Phone } from 'lucide-react'
import type { FabricStore } from '@/src/domain'

interface Props {
  store: FabricStore
}

export default function StoreCard({ store }: Props) {
  const hasLinks = store.phone || store.website
  return (
    <div className="bg-base-100 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{store.name}</p>
          {store.address && store.address !== 'Address not available' && (
            <p className="text-sm text-base-content/60 mt-0.5">{store.address}</p>
          )}
          {store.opening_hours && (
            <div className="text-xs text-base-content/50 flex items-start gap-1 mt-1">
              <Clock className="w-3 h-3 shrink-0 mt-0.5" />
              <div>
                {store.opening_hours
                  .split(';')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((line, j) => (
                    <div key={j}>{line}</div>
                  ))}
              </div>
            </div>
          )}
          {hasLinks && (
            <div className="flex gap-3 mt-2">
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3 h-3" /> {store.phone}
                </a>
              )}
              {store.website && (
                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  <Globe className="w-3 h-3" /> Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
