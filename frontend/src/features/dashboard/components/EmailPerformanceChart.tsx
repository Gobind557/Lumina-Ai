import { useState } from 'react'

interface DataPoint {
  day: string
  opens: number
  replies: number
  closed: number
}

const chartData: DataPoint[] = [
  { day: 'Mon', opens: 120, replies: 18, closed: 5 },
  { day: 'Tue', opens: 145, replies: 22, closed: 7 },
  { day: 'Wed', opens: 98, replies: 15, closed: 4 },
  { day: 'Thu', opens: 167, replies: 28, closed: 9 },
  { day: 'Fri', opens: 134, replies: 21, closed: 6 },
  { day: 'Sat', opens: 89, replies: 12, closed: 3 },
  { day: 'Sun', opens: 76, replies: 8, closed: 2 },
]

const maxValue = 200 // Fixed max for consistent scaling

interface TooltipData {
  x: number
  y: number
  day: string
  opens: number
  replies: number
  closed: number
}

export default function EmailPerformanceChart() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const getYPosition = (value: number) => {
    const percentage = (value / maxValue) * 100
    return 100 - percentage
  }

  // Create smooth curve path using cubic Bézier
  const createSmoothPath = (data: number[], color: string) => {
    if (data.length === 0) return ''
    
    const points = data.map((value, i) => ({
      x: (i * 100) + 50,
      y: getYPosition(value) * 2
    }))

    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
    
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const prev = points[i - 1] || current
      const afterNext = points[i + 2] || next
      
      // Control points for smooth curve
      const cp1x = current.x + (next.x - prev.x) / 6
      const cp1y = current.y + (next.y - prev.y) / 6
      const cp2x = next.x - (afterNext.x - current.x) / 6
      const cp2y = next.y - (afterNext.y - current.y) / 6
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
    }
    
    return path
  }

  // Create area path for gradient fill
  const createAreaPath = (data: number[]) => {
    if (data.length === 0) return ''
    
    const points = data.map((value, i) => ({
      x: (i * 100) + 50,
      y: getYPosition(value) * 2
    }))

    const path = createSmoothPath(data, '')
    const firstX = points[0].x
    const lastX = points[points.length - 1].x
    
    return `${path} L ${lastX} 200 L ${firstX} 200 Z`
  }

  const handlePointHover = (index: number, event: React.MouseEvent<SVGCircleElement>) => {
    const data = chartData[index]
    const rect = event.currentTarget.closest('svg')?.getBoundingClientRect()
    if (rect) {
      const x = (index * 100) + 50
      const svgX = (x / 700) * rect.width
      setTooltip({
        x: svgX,
        y: 50,
        day: data.day,
        opens: data.opens,
        replies: data.replies,
        closed: data.closed,
      })
      setHoveredIndex(index)
    }
  }

  const handlePointLeave = () => {
    setTooltip(null)
    setHoveredIndex(null)
  }

  return (
    <div className="glass-card p-4 h-full flex flex-col relative overflow-hidden" style={{ maxHeight: '100%' }}>
      <div className="relative z-10 flex-shrink-0 mb-2">
        <h3 className="text-base font-semibold text-slate-900 mb-2">Email Performance</h3>
        
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/60"></div>
            <span className="text-sm text-slate-600">Opens</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/60"></div>
            <span className="text-sm text-slate-600">Replies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/60"></div>
            <span className="text-sm text-slate-600">Closed</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex-1 min-h-0 z-10" style={{ maxHeight: '200px' }}>
        <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: '200px' }}>
          <defs>
            {/* Enhanced glow filters */}
            <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feOffset in="coloredBlur" dx="0" dy="0" result="offsetBlur"/>
              <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feOffset in="coloredBlur" dx="0" dy="0" result="offsetBlur"/>
              <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feOffset in="coloredBlur" dx="0" dy="0" result="offsetBlur"/>
              <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Gradient fills for area charts */}
            <linearGradient id="gradient-opens" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="gradient-replies" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="gradient-closed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y * 2}
              x2="700"
              y2={y * 2}
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Area fills for better visual appeal */}
          <path
            d={createAreaPath(chartData.map(d => d.opens))}
            fill="url(#gradient-opens)"
            opacity="0.6"
            style={{ transition: 'opacity 0.3s ease' }}
          />
          <path
            d={createAreaPath(chartData.map(d => d.replies))}
            fill="url(#gradient-replies)"
            opacity="0.6"
            style={{ transition: 'opacity 0.3s ease' }}
          />
          <path
            d={createAreaPath(chartData.map(d => d.closed))}
            fill="url(#gradient-closed)"
            opacity="0.6"
            style={{ transition: 'opacity 0.3s ease' }}
          />
          
          {/* Opens line with smooth curves */}
          <path
            d={createSmoothPath(chartData.map(d => d.opens), 'blue')}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-blue)"
            style={{ 
              transition: 'opacity 0.3s ease',
              opacity: hoveredIndex === null ? 1 : 1
            }}
          />
          {chartData.map((d, i) => (
            <circle
              key={`opens-${i}`}
              cx={(i * 100) + 50}
              cy={getYPosition(d.opens) * 2}
              r={hoveredIndex === i ? 6 : 4}
              fill="#60a5fa"
              filter="url(#glow-blue)"
              onMouseEnter={(e) => handlePointHover(i, e)}
              onMouseLeave={handlePointLeave}
              style={{ 
                cursor: 'pointer',
                transition: 'r 0.2s ease, opacity 0.2s ease',
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.6
              }}
            />
          ))}

          {/* Replies line with smooth curves */}
          <path
            d={createSmoothPath(chartData.map(d => d.replies), 'cyan')}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-cyan)"
            style={{ 
              transition: 'opacity 0.3s ease',
              opacity: hoveredIndex === null ? 1 : 1
            }}
          />
          {chartData.map((d, i) => (
            <circle
              key={`replies-${i}`}
              cx={(i * 100) + 50}
              cy={getYPosition(d.replies) * 2}
              r={hoveredIndex === i ? 6 : 4}
              fill="#22d3ee"
              filter="url(#glow-cyan)"
              onMouseEnter={(e) => handlePointHover(i, e)}
              onMouseLeave={handlePointLeave}
              style={{ 
                cursor: 'pointer',
                transition: 'r 0.2s ease, opacity 0.2s ease',
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.6
              }}
            />
          ))}

          {/* Closed line with smooth curves */}
          <path
            d={createSmoothPath(chartData.map(d => d.closed), 'purple')}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-purple)"
            style={{ 
              transition: 'opacity 0.3s ease',
              opacity: hoveredIndex === null ? 1 : 1
            }}
          />
          {chartData.map((d, i) => (
            <circle
              key={`closed-${i}`}
              cx={(i * 100) + 50}
              cy={getYPosition(d.closed) * 2}
              r={hoveredIndex === i ? 6 : 4}
              fill="#a78bfa"
              filter="url(#glow-purple)"
              onMouseEnter={(e) => handlePointHover(i, e)}
              onMouseLeave={handlePointLeave}
              style={{ 
                cursor: 'pointer',
                transition: 'r 0.2s ease, opacity 0.2s ease',
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.6
              }}
            />
          ))}

          {/* Vertical hover line */}
          {hoveredIndex !== null && (
            <line
              x1={(hoveredIndex * 100) + 50}
              y1="0"
              x2={(hoveredIndex * 100) + 50}
              y2="200"
              stroke="rgba(148, 163, 184, 0.5)"
              strokeWidth="1"
              strokeDasharray="4,4"
              style={{ animation: 'fadeIn 0.2s ease' }}
            />
          )}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
          {chartData.map((d) => (
            <span key={d.day} className="text-xs text-slate-500">
              {d.day}
            </span>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2">
          {[0, 50, 100, 150, 200].map((value) => (
            <span key={value} className="text-xs text-slate-500">
              {value === 0 ? '0' : value < 1000 ? `${value}` : `${value / 1000}K`}
            </span>
          ))}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-lg p-3 shadow-2xl z-20 pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translateX(-50%) translateY(-100%)',
              marginTop: '-10px',
            }}
          >
            <div className="text-xs font-semibold text-slate-900 mb-2">{tooltip.day}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-xs text-slate-600">Opens:</span>
                <span className="text-xs font-semibold text-slate-900">{tooltip.opens}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <span className="text-xs text-slate-600">Replies:</span>
                <span className="text-xs font-semibold text-slate-900">{tooltip.replies}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-xs text-slate-600">Closed:</span>
                <span className="text-xs font-semibold text-slate-900">{tooltip.closed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
