'use client'

import { useCallback, useState } from 'react'
import { MEASUREMENTS } from '@/src/lib/constants'
import type { MeasurementValues } from '@/src/models'
import type { MeasurementFormState } from '@/src/components/measurement/MeasurementFields'

function emptyState(): MeasurementFormState {
  const acc: MeasurementFormState = { name: '' }
  for (const [key] of MEASUREMENTS) acc[key] = ''
  return acc
}

function fromValues(name: string, values: MeasurementValues): MeasurementFormState {
  const acc: MeasurementFormState = { name }
  for (const [key] of MEASUREMENTS) {
    const v = values[key]
    acc[key] = v != null ? String(v) : ''
  }
  return acc
}

function toValues(state: MeasurementFormState): MeasurementValues {
  const acc: MeasurementValues = {}
  for (const [key] of MEASUREMENTS) {
    const v = state[key]
    if (v !== '' && v != null) acc[key] = parseFloat(v)
  }
  return acc
}

export function useMeasurementForm() {
  const [state, setState] = useState<MeasurementFormState>(emptyState)
  const [invalid, setInvalid] = useState<Set<string>>(new Set())

  const setField = useCallback((key: string, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const setName = useCallback((value: string) => {
    setState((prev) => ({ ...prev, name: value }))
  }, [])

  const onMeasurementChange = useCallback((key: string, value: string) => {
    if (value !== '' && (Number.isNaN(Number(value)) || Number(value) < 0)) return
    setState((prev) => ({ ...prev, [key]: value }))
    setInvalid((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])

  const onMeasurementBlur = useCallback((key: string, value: string) => {
    if (value !== '' && (Number.isNaN(Number(value)) || Number(value) < 0)) {
      setInvalid((prev) => new Set([...prev, key]))
    }
  }, [])

  const reset = useCallback(() => {
    setState(emptyState())
    setInvalid(new Set())
  }, [])

  const load = useCallback((name: string, values: MeasurementValues) => {
    setState(fromValues(name, values))
    setInvalid(new Set())
  }, [])

  const hasAny = MEASUREMENTS.some(([key]) => state[key] !== '')

  return {
    state,
    invalid,
    setField,
    setName,
    onMeasurementChange,
    onMeasurementBlur,
    reset,
    load,
    hasAny,
    toValues: () => toValues(state),
  }
}
