'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import type { MeasurementSet, UpsertMeasurementSetInput } from '@/src/models'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'
import { useMeasurementForm } from '@/src/hooks/useMeasurementForm'
import MeasurementFields from './MeasurementFields'

interface Props {
  isEdit: boolean
  initial: MeasurementSet | null
  onSubmit: (input: UpsertMeasurementSetInput) => Promise<void>
  submitAfterMode: 'reset' | 'navigate'
  namePlaceholder?: string
}

export default function MeasurementForm({
  isEdit,
  initial,
  onSubmit,
  submitAfterMode,
  namePlaceholder = 'e.g. Ada — main costume',
}: Props) {
  const form = useMeasurementForm()
  const [nameTouched, setNameTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { load } = form
  useEffect(() => {
    if (initial) load(initial.name, initial.measurements)
  }, [initial, load])

  const nameError = nameTouched && !form.state.name.trim()

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameTouched(true)
    if (!form.state.name.trim() || !form.hasAny || form.invalid.size > 0) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ name: form.state.name.trim(), measurements: form.toValues() })
      if (submitAfterMode === 'reset') {
        form.reset()
        setNameTouched(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 6000)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 md:h-full">
      {error && <Alert>{error}</Alert>}

      <div className="flex items-center gap-3 shrink-0">
        <span className="flex-1 text-sm text-base-content/70">
          Designation <span className="text-error">*</span>
        </span>
        <input
          type="text"
          className={`input input-bordered input-sm w-48 ${nameError ? 'input-error' : ''}`}
          placeholder={namePlaceholder}
          value={form.state.name}
          onChange={(e) => form.setName(e.target.value)}
          onBlur={() => setNameTouched(true)}
        />
      </div>
      {nameError && (
        <p className="text-xs text-error text-right shrink-0 -mt-2">Name is required.</p>
      )}

      <div className="divider my-0 shrink-0" />

      <MeasurementFields
        values={form.state}
        invalid={form.invalid}
        onChange={form.onMeasurementChange}
        onBlur={form.onMeasurementBlur}
      />

      <button
        type="submit"
        className={`btn ${saved ? 'btn-success' : 'btn-primary'} w-full shrink-0`}
        disabled={saving || !form.hasAny}
      >
        {saving ? (
          <Spinner size="sm" />
        ) : saved ? (
          <>
            <Check className="w-4 h-4" /> Saved
          </>
        ) : isEdit ? (
          'Save'
        ) : (
          'Add'
        )}
      </button>
    </form>
  )
}
