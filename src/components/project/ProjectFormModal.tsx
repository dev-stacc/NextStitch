'use client'

import { type FormEvent, type RefObject } from 'react'
import type { MeasurementSet } from '@/src/models'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'
import GlobalMeasurementSetsPicker from './GlobalMeasurementSetsPicker'

export interface ProjectFormValues {
  name: string
  desc: string
  budget: string
}

interface ProjectFormModalProps {
  dialogRef: RefObject<HTMLDialogElement | null>
  mode?: 'create' | 'edit'
  values: ProjectFormValues
  setValues: (updater: (prev: ProjectFormValues) => ProjectFormValues) => void
  loading: boolean
  error: string | null
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  globalSets?: MeasurementSet[]
  selectedGlobalSets?: Set<number>
  setSelectedGlobalSets?: (updater: (prev: Set<number>) => Set<number>) => void
}

export default function ProjectFormModal(props: ProjectFormModalProps) {
  const {
    dialogRef,
    mode = 'create',
    values,
    setValues,
    loading,
    error,
    onSubmit,
    globalSets = [],
    selectedGlobalSets,
    setSelectedGlobalSets,
  } = props
  const isEdit = mode === 'edit'

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-md">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={() => dialogRef.current?.close()}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-5">{isEdit ? 'Edit Project' : 'New Project'}</h3>

        {error && <Alert className="mb-4">{error}</Alert>}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="form-control">
            <span className="label-text font-medium">
              Project name <span className="text-error">*</span>
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. Spring collection 2026"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              required
              autoFocus
            />
          </label>

          <label className="form-control">
            <span className="label-text font-medium">Description</span>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="What are you making?"
              value={values.desc}
              onChange={(e) => setValues((v) => ({ ...v, desc: e.target.value }))}
            />
          </label>

          <div className="form-control">
            <span className="label-text font-medium">Budget</span>
            <label className="input input-bordered w-full flex items-center gap-2">
              <span className="text-base-content/40 text-sm select-none">$</span>
              <input
                type="number"
                className="grow"
                placeholder="0.00"
                value={values.budget}
                onChange={(e) => setValues((v) => ({ ...v, budget: e.target.value }))}
                min="0"
                step="0.01"
              />
            </label>
          </div>

          {!isEdit && selectedGlobalSets && setSelectedGlobalSets && (
            <GlobalMeasurementSetsPicker
              sets={globalSets}
              selected={selectedGlobalSets}
              onChange={setSelectedGlobalSets}
            />
          )}

          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? <Spinner size="sm" /> : isEdit ? 'Save' : 'Create'}
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" aria-label="Close">
          <span className="sr-only">Close</span>
        </button>
      </form>
    </dialog>
  )
}
