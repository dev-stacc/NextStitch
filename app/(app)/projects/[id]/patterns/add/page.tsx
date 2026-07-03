'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { patternsApi, projectsApi } from '@/src/api'
import type { CreatePatternInput } from '@/src/models'
import Tabs from '@/src/components/ui/Tabs'
import GenerateSection from '@/src/components/pattern/GenerateSection'
import ManualSection from '@/src/components/pattern/ManualSection'
import ScrapeSection from '@/src/components/pattern/ScrapeSection'
import UploadSection from '@/src/components/pattern/UploadSection'
import { useBreadcrumb } from '@/src/contexts/BreadcrumbContext'

type Tab = 'search' | 'upload' | 'url' | 'generate'

const TABS: readonly { value: Tab; label: string }[] = [
  { value: 'search', label: 'Search' },
  { value: 'upload', label: 'Upload' },
  { value: 'url', label: 'URL' },
  { value: 'generate', label: 'Generate' },
]

export default function AddPatternPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { setCrumb } = useBreadcrumb()
  const [activeTab, setActiveTab] = useState<Tab>('search')

  useEffect(() => {
    projectsApi
      .get(id)
      .then((data) => setCrumb(data.name))
      .catch(() => {})
    return () => setCrumb(null)
  }, [id, setCrumb])

  const savePattern = (body: CreatePatternInput) => patternsApi.create(id, body)
  const goBack = () => router.push(`/projects/${id}`)

  return (
    <div className="flex flex-col md:h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-semibold">Add Pattern</h1>
        <button type="button" className="btn btn-ghost btn-sm" onClick={goBack}>
          ← Back
        </button>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'search' && (
        <div className="bg-base-200 rounded-xl p-4 flex flex-col md:flex-1 md:min-h-0">
          <ScrapeSection projectId={id} onSave={savePattern} />
        </div>
      )}
      {activeTab === 'upload' && (
        <div className="bg-base-200 rounded-xl p-4 overflow-y-auto md:flex-1">
          <UploadSection projectId={id} onDone={goBack} />
        </div>
      )}
      {activeTab === 'url' && (
        <div className="bg-base-200 rounded-xl p-4 overflow-y-auto md:flex-1">
          <ManualSection onSave={savePattern} onDone={goBack} />
        </div>
      )}
      {activeTab === 'generate' && <GenerateSection projectId={id} onDone={goBack} />}
    </div>
  )
}
