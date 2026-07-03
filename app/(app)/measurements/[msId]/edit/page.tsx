'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { measurementsApi } from '@/src/api'
import type { MeasurementSet } from '@/src/domain'
import MeasurementForm from '@/src/components/measurement/MeasurementForm'
import MeasurementPageShell from '@/src/components/measurement/MeasurementPageShell'
import Spinner from '@/src/components/ui/Spinner'

export default function EditGlobalMeasurementSetPage() {
  const router = useRouter()
  const { msId } = useParams<{ msId: string }>()
  const [initial, setInitial] = useState<MeasurementSet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    measurementsApi
      .listGlobal()
      .then((sets) => setInitial(sets.find((s) => s.id === Number(msId)) ?? null))
      .finally(() => setLoading(false))
  }, [msId])

  return (
    <MeasurementPageShell title="Edit Measurements" backHref="/measurements">
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
            await measurementsApi.updateGlobal(msId, input)
            router.push('/measurements')
          }}
        />
      )}
    </MeasurementPageShell>
  )
}
