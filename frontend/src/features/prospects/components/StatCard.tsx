import type { ReactNode } from 'react'
import { cx, Surface } from './ui'

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  hint?: string
}) {
  return (
    <Surface className={cx('p-4')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-slate-600">{label}</p>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="shrink-0 rounded-xl border border-slate-200/70 bg-white/70 p-2 text-slate-600">
            {icon}
          </div>
        ) : null}
      </div>
    </Surface>
  )
}

