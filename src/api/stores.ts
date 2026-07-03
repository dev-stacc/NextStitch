import type { NearbyStoresRequest, NearbyStoresResponse } from '@/src/domain'
import { requestJson } from './http'

export interface StoresApi {
  nearby(input: NearbyStoresRequest): Promise<NearbyStoresResponse>
}

export const storesApi: StoresApi = {
  nearby: (input) =>
    requestJson<NearbyStoresResponse>('/api/stores/nearby', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
