'use client'

import { useState } from 'react'
import { materialsApi } from '@/src/api'
import type { Material } from '@/src/domain'

interface Return {
  pending: Material | null
  toggle: (material: Material, newPurchased: 0 | 1) => void
  confirm: (input: { price: number; quantity: string }) => void
  cancel: () => void
}

export function useMaterialPurchase(
  projectId: number | string,
  onUpdated: (material: Material) => void,
): Return {
  const [pending, setPending] = useState<Material | null>(null)

  async function toggle(material: Material, newPurchased: 0 | 1) {
    if (newPurchased === 1) {
      setPending(material)
      return
    }
    try {
      const updated = await materialsApi.update(projectId, material.id, {
        purchased: 0,
        price: null,
        quantity: null,
      })
      onUpdated(updated)
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  async function confirm({ price, quantity }: { price: number; quantity: string }) {
    if (!pending) return
    try {
      const updated = await materialsApi.update(projectId, pending.id, {
        purchased: 1,
        price,
        quantity,
      })
      onUpdated(updated)
      setPending(null)
    } catch (err) {
      console.error('Confirm purchase failed:', err)
    }
  }

  return { pending, toggle, confirm, cancel: () => setPending(null) }
}
