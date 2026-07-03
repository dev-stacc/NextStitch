'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { measurementsApi } from '@/src/api'
import type { MeasurementSet } from '@/src/domain'
import Spinner from '@/src/components/ui/Spinner'
import MeasurementSetRow from '@/src/components/measurement/MeasurementSetRow'
import MeasurementSetModal from '@/src/components/measurement/MeasurementSetModal'

export default function MyMeasurementsPage() {
  const router = useRouter()
  const [sets, setSets] = useState<MeasurementSet[]>([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<(MeasurementSet & { editUrl?: string }) | null>(null)

  useEffect(() => {
    measurementsApi
      .listGlobal()
      .then(setSets)
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number) {
    await measurementsApi.removeGlobal(id)
    setSets((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <>
      {preview && <MeasurementSetModal ms={preview} onClose={() => setPreview(null)} />}

      <div className="flex flex-col md:h-full gap-4">
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-2xl font-semibold">Saved measurements</h1>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push('/')}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => router.push('/measurements/add')}
            >
              + Add
            </button>
          </div>
        </div>

        <div className="bg-base-200 rounded-xl p-4 flex flex-col md:flex-1 md:min-h-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : sets.length === 0 ? (
            <p className="text-base-content/40 text-sm px-2 py-8 text-center">
              No measurement sets yet. Add one to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-1 overflow-y-auto">
              {sets.map((ms) => (
                <MeasurementSetRow
                  key={ms.id}
                  ms={ms}
                  onView={() => setPreview({ ...ms, editUrl: `/measurements/${ms.id}/edit` })}
                  onDelete={() => handleDelete(ms.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
