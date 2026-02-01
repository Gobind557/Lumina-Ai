interface PerformanceMetricCardProps {
  label: string
  value: string
  change: string
  color: 'blue' | 'purple' | 'white'
}

export default function PerformanceMetricCard({
  label,
  value,
  change,
  color,
}: PerformanceMetricCardProps) {
  const getCardStyles = () => {
    switch (color) {
      case 'blue':
        return {
          border: 'border-indigo-200/70',
          text: 'text-indigo-600',
          shadow: 'shadow-indigo-500/10',
        }
      case 'purple':
        return {
          border: 'border-purple-200/70',
          text: 'text-purple-600',
          shadow: 'shadow-purple-500/10',
        }
      default:
        return {
          border: 'border-slate-200/70',
          text: 'text-slate-900',
          shadow: 'shadow-slate-500/5',
        }
    }
  }

  const styles = getCardStyles()

  return (
    <div className={`glass-card border ${styles.border} p-4 relative overflow-hidden ${styles.shadow}`}>
      <div className="relative z-10">
        <div className="text-sm text-slate-600 mb-2">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${styles.text}`}>
            {value}
          </span>
          <span className="text-sm font-semibold text-emerald-600">{change}</span>
        </div>
      </div>
    </div>
  )
}
