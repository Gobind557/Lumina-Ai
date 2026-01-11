import { useState, useRef, useEffect } from 'react'
import { MessageSquare, ChevronRight } from 'lucide-react'

interface ToneCardProps {
  tone?: 'formal' | 'casual'
  onToneChange?: (tone: 'formal' | 'casual') => void
}

export default function ToneCard({ tone = 'casual', onToneChange }: ToneCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToneSelect = (selectedTone: 'formal' | 'casual') => {
    onToneChange?.(selectedTone)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-4 space-y-3 flex-shrink-0">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wide mb-1">
          Tone
        </h3>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between hover:bg-blue-950/30 rounded-lg px-2 py-2.5 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MessageSquare className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <span className="text-sm text-white">Tone</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-sm font-semibold text-blue-300">
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </span>
            <ChevronRight className="w-4 h-4 text-blue-300" />
          </div>
        </button>
      </div>

      {/* Popup Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-blue-900/95 backdrop-blur-xl border border-blue-800/60 rounded-lg shadow-xl animate-fade-in overflow-hidden">
          <div className="p-1.5">
            <button
              onClick={() => handleToneSelect('casual')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                tone === 'casual'
                  ? 'bg-blue-800/50 text-white'
                  : 'hover:bg-blue-800/30 text-gray-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                tone === 'casual' ? 'bg-blue-400' : 'bg-transparent border border-blue-600'
              }`}></div>
              <span className="text-sm font-medium">Casual</span>
              {tone === 'casual' && (
                <span className="ml-auto text-xs text-blue-300">✓</span>
              )}
            </button>
            
            <button
              onClick={() => handleToneSelect('formal')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                tone === 'formal'
                  ? 'bg-blue-800/50 text-white'
                  : 'hover:bg-blue-800/30 text-gray-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                tone === 'formal' ? 'bg-blue-400' : 'bg-transparent border border-blue-600'
              }`}></div>
              <span className="text-sm font-medium">Formal</span>
              {tone === 'formal' && (
                <span className="ml-auto text-xs text-blue-300">✓</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
