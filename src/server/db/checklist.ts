import type {
  ChecklistItem,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from '@/src/models'
import type { ChecklistRepo } from './types'
import { DbState, nextId } from './state'

export class MemoryChecklist implements ChecklistRepo {
  constructor(private readonly state: DbState) {}

  async list(projectId: number): Promise<ChecklistItem[]> {
    const row = this.state.projects.get(projectId)
    return row ? [...row.checklist] : []
  }

  async create(
    projectId: number,
    input: CreateChecklistItemInput,
  ): Promise<ChecklistItem | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const item: ChecklistItem = {
      id: nextId(),
      title: input.title,
      notes: input.notes ?? '',
      checked: 0,
      image_urls: [],
    }
    row.checklist.push(item)
    return item
  }

  async update(
    projectId: number,
    itemId: number,
    input: UpdateChecklistItemInput,
  ): Promise<ChecklistItem | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const item = row.checklist.find((i) => i.id === itemId)
    if (!item) return null
    if (input.title !== undefined) item.title = input.title
    if (input.notes !== undefined) item.notes = input.notes
    if (input.image_urls !== undefined) item.image_urls = [...input.image_urls]
    return item
  }

  async toggle(projectId: number, itemId: number): Promise<ChecklistItem | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const item = row.checklist.find((i) => i.id === itemId)
    if (!item) return null
    item.checked = item.checked ? 0 : 1
    return item
  }

  async remove(projectId: number, itemId: number): Promise<boolean> {
    const row = this.state.projects.get(projectId)
    if (!row) return false
    const before = row.checklist.length
    row.checklist = row.checklist.filter((i) => i.id !== itemId)
    return row.checklist.length !== before
  }

  async reorder(projectId: number, ids: number[]): Promise<boolean> {
    const row = this.state.projects.get(projectId)
    if (!row) return false
    const map = new Map(row.checklist.map((i) => [i.id, i]))
    const reordered: ChecklistItem[] = []
    for (const id of ids) {
      const item = map.get(id)
      if (item) reordered.push(item)
    }
    for (const item of row.checklist) {
      if (!ids.includes(item.id)) reordered.push(item)
    }
    row.checklist = reordered
    return true
  }
}
