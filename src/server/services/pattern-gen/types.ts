export type Shape = 'rectangle' | 'trapezoid' | 'right_triangle'
export type Grain = 'straight' | 'bias' | 'cross'

export interface RectangleDims {
  width_cm: number
  height_cm: number
}
export interface TrapezoidDims {
  top_cm: number
  bottom_cm: number
  height_cm: number
}
export interface RightTriangleDims {
  leg1_cm: number
  leg2_cm: number
}
export type Dimensions = RectangleDims | TrapezoidDims | RightTriangleDims

export interface PatternPiece {
  name: string
  shape: Shape
  dimensions: Dimensions
  cut_count: number
  on_fold: boolean
  grain: Grain
  notes?: string | null
}

export interface PatternSpec {
  title: string
  instructions: string[]
  pieces: PatternPiece[]
}

export const SEAM_ALLOWANCE_CM = 1.5
