'use client'

import { useRouter } from 'next/navigation'
import type { MeasurementSet } from '@/src/models'
import { MEASUREMENTS } from '@/src/lib/constants'
import Modal from '@/src/components/ui/Modal'
import ModalHeader from '@/src/components/ui/ModalHeader'

interface Props {
  ms: MeasurementSet & { editUrl?: string }
  onClose: () => void
}

export default function MeasurementSetModal({ ms, onClose }: Props) {
  const router = useRouter()
  const filled = MEASUREMENTS.filter(([key]) => ms.measurements[key] != null)

  return (
    <Modal
      onClose={onClose}
      contentClassName="relative bg-base-100 rounded-xl shadow-2xl flex flex-col"
    >
      <div style={{ width: '80vw', maxWidth: 500, maxHeight: '80vh' }} className="flex flex-col">
        <ModalHeader
          title={ms.name}
          onClose={onClose}
          onEdit={
            ms.editUrl
              ? () => {
                  onClose()
                  router.push(ms.editUrl!)
                }
              : undefined
          }
        />
        <div className="overflow-y-auto p-4">
          {filled.length > 0 ? (
            <ul className="space-y-2">
              {filled.map(([key, label]) => (
                <li key={key} className="flex items-center justify-between text-sm">
                  <span className="text-base-content/70">{label}</span>
                  <span className="font-medium ml-4 shrink-0">
                    {ms.measurements[key]} cm
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base-content/40 text-sm">No measurements recorded.</p>
          )}
        </div>
      </div>
    </Modal>
  )
}
