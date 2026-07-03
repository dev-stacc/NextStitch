export interface ChecklistItem {
  id: number
  title: string
  notes: string | null
  checked: 0 | 1
  image_urls: string[]
}

export interface CreateChecklistItemInput {
  title: string
  notes?: string
}

export interface UpdateChecklistItemInput {
  title?: string
  notes?: string | null
  image_urls?: string[]
}
