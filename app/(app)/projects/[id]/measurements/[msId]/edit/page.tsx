'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { measurementsApi } from '@/src/api'
import type { MeasurementSet } from '@/src/domain'
import MeasurementForm from '@/src/components/measurement/MeasurementForm'
import MeasurementPageShell from '@/src/components/measurement/MeasurementPageShell'
import Spinner from '@/src/components/ui/Spinner'

export default function EditProjectMeasurementSetPage() {
  const router = useRouter()
  const { id, msId } = useParams<{ id: string; msId: string }>()
  const [initial, setInitial] = useState<MeasurementSet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    measurementsApi
      .listForProject(id)
      .then((sets) => setInitial(sets.find((s) => s.id === Number(msId)) ?? null))
      .finally(() => setLoading(false))
  }, [id, msId])

  return (
    <MeasurementPageShell title="Edit Measurements" backHref={`/projects/${id}`}>
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <MeasurementForm
          isEdit
          initial={initial}
          submitAfterMode="navigate"
          onSubmit={async (input) => {
            await measurementsApi.updateForProject(id, msId, input)
            router.push(`/projects/${id}`)
          }}
        />
      )}
    </MeasurementPageShell>
  )
}
