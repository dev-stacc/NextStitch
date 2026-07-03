'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { materialsApi, projectsApi } from '@/src/api'
import type { CreateMaterialInput } from '@/src/domain'
import Tabs from '@/src/components/ui/Tabs'
import ManualSection from '@/src/components/material/ManualSection'
import SearchSection from '@/src/components/material/SearchSection'
import { useBreadcrumb } from '@/src/contexts/BreadcrumbContext'

type Tab = 'search' | 'manual'

const TABS: readonly { value: Tab; label: string }[] = [
  { value: 'search', label: 'Search' },
  { value: 'manual', label: 'Manual Upload' },
]

export default function AddMaterialPage() {
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

  const saveMaterial = (body: CreateMaterialInput) => materialsApi.create(id, body)
  const goBack = () => router.push(`/projects/${id}`)

  return (
    <div className="flex flex-col md:h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-semibold">Add Material</h1>
        <button type="button" className="btn btn-ghost btn-sm" onClick={goBack}>
          ← Back
        </button>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'search' && (
        <div className="bg-base-200 rounded-xl p-4 flex flex-col md:flex-1 md:min-h-0">
          <SearchSection projectId={id} onSave={saveMaterial} />
        </div>
      )}
      {activeTab === 'manual' && (
        <div className="bg-base-200 rounded-xl p-4 overflow-y-auto md:flex-1">
          <ManualSection projectId={id} onSave={saveMaterial} onDone={goBack} />
        </div>
      )}
    </div>
  )
}
