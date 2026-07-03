'use client'

import { useParams } from 'next/navigation'
import { measurementsApi } from '@/src/api'
import MeasurementForm from '@/src/components/measurement/MeasurementForm'
import MeasurementPageShell from '@/src/components/measurement/MeasurementPageShell'

export default function AddProjectMeasurementSetPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <MeasurementPageShell title="Add Measurements" backHref={`/projects/${id}`}>
      <MeasurementForm
        isEdit={false}
        initial={null}
        submitAfterMode="reset"
        onSubmit={(input) => measurementsApi.createForProject(id, input).then(() => {})}
      />
    </MeasurementPageShell>
  )
}
