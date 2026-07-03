export type GrainDirection = 'straight' | 'bias' | 'cross'

export interface Material {
  id: number
  name: string
  quantity: string | null
  price: number | null
  image_url: string | null
  notes: string | null
  care_instructions: string | null
  grain_direction: GrainDirection | null
  pre_wash: 0 | 1
  purchased: 0 | 1
}

export interface MaterialSearchHit {
  source: string
  title: string
  url: string
  image_url: string | null
  price: string | null
}

export interface CreateMaterialInput {
  name: string
  quantity?: string | null
  price?: number | null
  image_url?: string | null
  notes?: string | null
  care_instructions?: string | null
  grain_direction?: GrainDirection | null
  pre_wash?: 0 | 1
}

export interface UpdateMaterialInput extends Partial<CreateMaterialInput> {
  purchased?: 0 | 1
}
