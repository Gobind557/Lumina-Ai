import { useState, useRef, useEffect } from 'react'
import { FileText, Smile, ChevronRight } from 'lucide-react'

interface ToneCardProps {
  tone?: 'formal' | 'casual'
  personalizationStrength?: 'weak' | 'moderate' | 'strong'
  onToneChange?: (tone: 'formal' | 'casual') => void
}

export default function ToneCard({ 
  tone = 'casual', 
  personalizationStrength = 'strong',
  onToneChange 
}: ToneCardProps) {
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
      {/* Second Card: Tone & Personalization */}
      <div className="bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-4 space-y-3 flex-shrink-0">
        {/* Tone */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between hover:bg-blue-950/30 rounded-lg px-2 py-2 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <span className="text-sm text-white">Tone</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-sm text-white">
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </div>
        </button>

        {/* Personalization */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Smile className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-white">Personalization</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-green-500">
              {personalizationStrength.charAt(0).toUpperCase() + personalizationStrength.slice(1)}
            </span>
          </div>
        </div>
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
