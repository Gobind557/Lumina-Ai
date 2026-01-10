import { Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="glass-nav px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500/50 p-2 rounded-lg shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Lumina AI</h1>
          <p className="text-xs text-blue-200">Sales Copilot</p>
        </div>
      </div>
    </header>
  )
}
