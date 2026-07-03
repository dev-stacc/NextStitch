export interface FabricStore {
  name: string
  address: string | null
  phone: string | null
  website: string | null
  opening_hours: string | null
  lat: number
  lon: number
}

export interface NearbyStoresRequest {
  lat: number
  lon: number
  radius_m: number
}

export interface NearbyStoresResponse {
  stores: FabricStore[]
}
