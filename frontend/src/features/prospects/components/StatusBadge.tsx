import { cx } from './ui'

export type ProspectStatus = 'Active' | 'Pending' | 'Replied'

const styles: Record<ProspectStatus, { bg: string; text: string; ring: string }> = {
  Active: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
  },
  Pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
  },
  Replied: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    ring: 'ring-violet-200',
  },
}

export function StatusBadge({ status }: { status: ProspectStatus }) {
  const s = styles[status]
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        s.bg,
        s.text,
        'ring-1 ring-inset',
        s.ring,
      )}
    >
      {status}
    </span>
  )
}

