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
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          shadow: 'shadow-blue-500/20',
        }
      case 'purple':
        return {
          border: 'border-purple-500/40',
          text: 'text-purple-400',
          shadow: 'shadow-purple-500/20',
        }
      default:
        return {
          border: 'border-gray-500/30',
          text: 'text-white',
          shadow: 'shadow-gray-500/10',
        }
    }
  }

  const styles = getCardStyles()

  return (
    <div className={`bg-blue-900/30 backdrop-blur-xl border ${styles.border} rounded-lg p-4 shadow-2xl ${styles.shadow} relative overflow-hidden`}>
      {/* Enhanced Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      <div className="relative z-10">
        <div className="text-sm text-gray-300 mb-2">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${styles.text}`}>
            {value}
          </span>
          <span className="text-sm font-semibold text-green-400">{change}</span>
        </div>
      </div>
    </div>
  )
}
