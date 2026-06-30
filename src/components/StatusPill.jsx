'use client'

import { getStatusDetails } from '@/lib/status'

export default function StatusPill({ status }) {
  const details = getStatusDetails(status)

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${details.bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${details.dotClass}`} />
      {details.label}
    </span>
  )
}
