import type { ProjectStatus } from '@/src/domain'
import { STATUS_OPTIONS } from '@/src/lib/constants'

interface Props {
  status: ProjectStatus | null | undefined
  className?: string
}

export default function ProjectStatusDot({ status, className = '' }: Props) {
  const opt = STATUS_OPTIONS.find((o) => o.value === (status ?? 'to_start')) ?? STATUS_OPTIONS[0]
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot} ${className}`}
      title={opt.label}
    />
  )
}
