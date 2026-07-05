'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { patternsApi, projectsApi } from '@/src/api'
import type { MeasurementSet } from '@/src/models'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'

interface Props {
  projectId: number | string
  onDone: () => void
}

interface DisplaySet extends MeasurementSet {
  displayName: string
}

interface Generated {
  title: string
  pdf_url: string | null
}

export default function GenerateSection({ projectId, onDone }: Props) {
  const [sets, setSets] = useState<DisplaySet[]>([])
  const [selectedSetId, setSelectedSetId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<Generated | null>(null)

  useEffect(() => {
    projectsApi
      .get(projectId)
      .then((project) => {
        const projectSets: DisplaySet[] = project.measurement_sets.map((s) => ({
          ...s,
          displayName: s.name,
        }))
        const globalSets: DisplaySet[] = project.global_measurement_sets.map((s) => ({
          ...s,
          displayName: `Shared: ${s.name}`,
        }))
        const all = [...projectSets, ...globalSets]
        setSets(all)
        if (all.length > 0) setSelectedSetId(String(all[0].id))
      })
      .catch(() => {})
  }, [projectId])

  async function handleGenerate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ms = sets.find((s) => s.id === Number(selectedSetId))
    if (!ms) return
    setLoading(true)
    setError(null)
    setGenerated(null)
    try {
      const patterns = await patternsApi.generateAi(projectId, {
        prompt,
        measurements: ms.measurements,
      })
      setGenerated({
        title: patterns[0]?.title ?? 'Generated pattern',
        pdf_url: patterns[0]?.url ?? null,
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:flex-1 md:min-h-0">
      <div className="bg-base-200 rounded-xl p-4 overflow-y-auto">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <h2 className="text-lg font-medium mb-1">AI Pattern Generator</h2>
            <p className="text-sm text-base-content/50">
              Describe a garment and Claude will draft a printable pattern from your measurements.
            </p>
          </div>

          <label className="form-control">
            <span className="label-text font-medium">
              Measurement set <span className="text-error">*</span>
            </span>
            {sets.length === 0 ? (
              <p className="text-sm text-base-content/50 italic">
                No measurement sets found. Add one to your project first.
              </p>
            ) : (
              <select
                className="select select-bordered select-sm w-full"
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(e.target.value)}
              >
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.displayName}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="form-control">
            <span className="label-text font-medium">
              Garment description <span className="text-error">*</span>
            </span>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              placeholder="e.g. wide-leg palazzo pants with elastic waist and side seam pockets"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>

          {error && <Alert className="text-sm">{error}</Alert>}

          <button
            type="submit"
            className="btn border-orange-500 text-orange-500 hover:bg-orange-500 hover:border-orange-500 hover:text-white w-full"
            disabled={loading || !selectedSetId || !prompt.trim()}
          >
            {loading ? (
              <>
                <Spinner size="sm" /> Generating…
              </>
            ) : (
              'Generate with AI'
            )}
          </button>
        </form>
      </div>

      <div className="bg-base-200 rounded-xl p-4 flex flex-col gap-3">
        {!generated ? (
          <p className="text-base-content/40 text-sm m-auto text-center px-4">
            Select a measurement set, describe your garment, and click Generate.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between shrink-0">
              <p className="font-medium">{generated.title}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={onDone}>
                Done — go to project
              </button>
            </div>
            <p className="text-sm text-base-content/60 shrink-0">
              Pattern saved to your project. Preview the PDF below.
            </p>
            <div className="h-64 md:flex-1 md:min-h-0 rounded overflow-hidden border border-base-300">
              {generated.pdf_url && (
                <iframe
                  src={generated.pdf_url}
                  className="w-full h-full"
                  title="Generated pattern preview"
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
