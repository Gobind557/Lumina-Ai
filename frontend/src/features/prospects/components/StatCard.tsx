import type { ReactNode } from 'react'

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
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-5 shadow-sm transition-all hover:shadow-md group cursor-default">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
            {hint && <span className="text-[10px] text-emerald-500 font-bold">{hint}</span>}
          </div>
        </div>
        {icon ? (
          <div className="shrink-0 w-10 h-10 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-indigo-500 border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  )
}

