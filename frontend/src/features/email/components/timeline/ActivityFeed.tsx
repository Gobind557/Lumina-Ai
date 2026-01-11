import { Mail, Link as LinkIcon, MessageSquare, Check } from 'lucide-react'

interface ActivityItem {
  type: 'email_opened' | 'link_clicked' | 'reply'
  timestamp: string
  description?: string
}

interface ActivityFeedProps {
  activities?: ActivityItem[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  // Default data for MVP
  const defaultActivities: ActivityItem[] = [
    { type: 'email_opened', timestamp: '5m ago' },
    { type: 'link_clicked', timestamp: '20m ago' },
    { type: 'reply', timestamp: 'Yesterday' },
  ]

  const data = activities || defaultActivities

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'email_opened':
        return <Mail className="w-4 h-4 text-green-500" />
      case 'link_clicked':
        return <LinkIcon className="w-4 h-4 text-blue-500" />
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      default:
        return <Mail className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'email_opened':
        return 'Email Opened'
      case 'link_clicked':
        return 'Link Clicked'
      case 'reply':
        return 'Previous Reply'
      default:
        return 'Activity'
    }
  }

  return (
    <div className="bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-3 space-y-2.5 flex-shrink-0">
      <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
        Activity Feed
      </h3>
      <div className="space-y-2.5">
        {data.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {getActivityLabel(activity.type)}
              </p>
              <p className="text-xs text-blue-200 mt-0.5">
                {activity.timestamp}
              </p>
            </div>
            {activity.type === 'email_opened' && (
              <div className="flex-shrink-0">
                <Check className="w-4 h-4 text-green-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
