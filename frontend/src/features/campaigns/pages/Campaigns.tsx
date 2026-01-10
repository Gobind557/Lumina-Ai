import { Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'

export default function Campaigns() {
  const navigate = useNavigate()
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Campaigns</h1>
        <button
          onClick={() => navigate(ROUTES.COMPOSE)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border border-gray-700"
        >
          <Mail className="w-4 h-4" />
          Compose Email
        </button>
      </div>
      <div className="glass-card p-6">
        <p className="text-gray-400">Campaigns content coming soon...</p>
      </div>
    </div>
  )
}
