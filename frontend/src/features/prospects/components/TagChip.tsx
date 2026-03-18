import { cx } from './ui'

export function TagChip({
  label,
  count,
  active,
  onClick,
  tone = 'neutral',
}: {
  label: string
  count?: number
  active?: boolean
  onClick?: () => void
  tone?: 'neutral' | 'purple' | 'red'
}) {
  const base =
    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border'

  const toneStyles =
    tone === 'red'
      ? 'text-red-700 border-red-200 bg-red-50 hover:bg-red-100'
      : tone === 'purple'
        ? 'text-violet-700 border-violet-200 bg-violet-50 hover:bg-violet-100'
        : 'text-slate-700 border-slate-200/70 bg-white/70 hover:bg-white'

  const activeStyles = active
    ? 'ring-2 ring-[#7c3aed]/20 border-[#7c3aed]/30'
    : ''

  return (
    <button type="button" onClick={onClick} className={cx(base, toneStyles, activeStyles)}>
      <span>{label}</span>
      {count != null ? <span className="text-xs opacity-75">{count}</span> : null}
    </button>
  )
}

