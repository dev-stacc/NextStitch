'use client'

import { useState } from 'react'
import { patternsApi } from '@/src/api'
import type { Pattern } from '@/src/domain'

interface Return {
  pending: Pattern | null
  toggle: (pattern: Pattern, newPurchased: 0 | 1) => void
  confirm: (input: { price_paid: number }) => void
  cancel: () => void
}

export function usePatternPurchase(
  projectId: number | string,
  onUpdated: (pattern: Pattern) => void,
): Return {
  const [pending, setPending] = useState<Pattern | null>(null)

  async function toggle(pattern: Pattern, newPurchased: 0 | 1) {
    if (newPurchased === 1) {
      setPending(pattern)
      return
    }
    try {
      const updated = await patternsApi.update(projectId, pattern.id, {
        purchased: 0,
        price_paid: null,
        title: pattern.title ?? '',
        notes: pattern.notes,
      })
      onUpdated(updated)
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  async function confirm({ price_paid }: { price_paid: number }) {
    if (!pending) return
    try {
      const updated = await patternsApi.update(projectId, pending.id, {
        purchased: 1,
        price_paid,
        title: pending.title ?? '',
        notes: pending.notes,
      })
      onUpdated(updated)
      setPending(null)
    } catch (err) {
      console.error('Confirm purchase failed:', err)
    }
  }

  return { pending, toggle, confirm, cancel: () => setPending(null) }
}
