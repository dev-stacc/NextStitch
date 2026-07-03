import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let configured = false

export function configureLeafletIcons(): void {
  if (configured) return
  configured = true
  // Merge default icon URLs so bundlers resolve the assets from the leaflet package.
  const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown }
  delete proto._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: (markerIcon as unknown as { src: string }).src ?? markerIcon,
    iconRetinaUrl: (markerIcon2x as unknown as { src: string }).src ?? markerIcon2x,
    shadowUrl: (markerShadow as unknown as { src: string }).src ?? markerShadow,
  })
}
