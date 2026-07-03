'use client'

import { measurementsApi } from '@/src/api'
import MeasurementForm from '@/src/components/measurement/MeasurementForm'
import MeasurementPageShell from '@/src/components/measurement/MeasurementPageShell'

export default function AddGlobalMeasurementSetPage() {
  return (
    <MeasurementPageShell title="Add Measurements" backHref="/measurements">
      <MeasurementForm
        isEdit={false}
        initial={null}
        submitAfterMode="reset"
        onSubmit={(input) => measurementsApi.createGlobal(input).then(() => {})}
      />
    </MeasurementPageShell>
  )
}
