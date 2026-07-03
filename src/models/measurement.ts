export type MeasurementValues = Record<string, number | null>

export interface MeasurementSet {
  id: number
  name: string
  measurements: MeasurementValues
}

export interface UpsertMeasurementSetInput {
  name: string
  measurements: MeasurementValues
}
