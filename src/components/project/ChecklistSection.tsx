'use client'

import { type FormEvent, useEffect, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { checklistApi } from '@/src/api'
import type { ChecklistItem } from '@/src/domain'
import Spinner from '@/src/components/ui/Spinner'
import ChecklistItemModal from './ChecklistItemModal'
import SortableChecklistItem from './SortableChecklistItem'

interface Props {
  projectId: number | string
  initialItems: ChecklistItem[]
}

export default function ChecklistSection({ projectId, initialItems }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [completing, setCompleting] = useState<ChecklistItem | null>(null)
  const [editing, setEditing] = useState<ChecklistItem | null>(null)

  useEffect(() => setItems(initialItems), [initialItems])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const checkedCount = items.filter((i) => !!i.checked).length

  function handleSaved(updated: ChecklistItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setCompleting(null)
    setEditing(null)
  }

  function handleCheckChange(item: ChecklistItem) {
    if (!item.checked) {
      setCompleting(item)
      return
    }
    checklistApi
      .toggle(projectId, item.id)
      .then((updated) => setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i))))
      .catch((err) => console.error('Uncheck failed:', err))
  }

  async function handleDelete(itemId: number) {
    try {
      await checklistApi.remove(projectId, itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    checklistApi
      .reorder(
        projectId,
        reordered.map((i) => i.id),
      )
      .catch((err) => console.error('Reorder failed:', err))
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      await checklistApi.create(projectId, { title: newTitle.trim(), notes: '' })
      const listed = await checklistApi.list(projectId)
      setItems(listed)
      setNewTitle('')
    } catch (err) {
      console.error('Add failed:', err)
    } finally {
      setAdding(false)
    }
  }

  const activeModal = completing || editing

  return (
    <>
      {activeModal && (
        <ChecklistItemModal
          item={activeModal}
          projectId={projectId}
          mode={completing ? 'complete' : 'view'}
          onSaved={handleSaved}
          onClose={() => {
            setCompleting(null)
            setEditing(null)
          }}
        />
      )}
      <div className="flex flex-col md:flex-1 md:min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-lg font-medium">Checklist</h2>
          {items.length > 0 && (
            <span className="text-sm text-base-content/50">
              {checkedCount} / {items.length} done
            </span>
          )}
        </div>
        <form onSubmit={handleAdd} className="flex gap-2 mb-3 shrink-0">
          <input
            type="text"
            className="input input-bordered input-sm flex-1"
            placeholder="Add item…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-sm btn-primary"
            disabled={adding || !newTitle.trim()}
          >
            {adding ? <Spinner size="xs" /> : 'Add'}
          </button>
        </form>
        <div className="md:flex-1 md:min-h-0 overflow-y-auto">
          {items.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {items.map((item) => (
                    <SortableChecklistItem
                      key={item.id}
                      item={item}
                      onCheckChange={handleCheckChange}
                      onEdit={setEditing}
                      onDelete={handleDelete}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-base-content/40 text-sm px-2">No checklist items yet.</p>
          )}
        </div>
      </div>
    </>
  )
}
