import { Mail, Link as LinkIcon, MessageSquare, Check } from 'lucide-react'

export interface ActivityItem {
  type: 'email_opened' | 'link_clicked' | 'reply'
  timestamp: string
  description?: string
  prospectName?: string
}

interface ActivityFeedProps {
  activities?: ActivityItem[]
  /** When true, show empty state instead of placeholder data */
  emptyMessage?: string
}

export default function ActivityFeed({ activities, emptyMessage }: ActivityFeedProps) {
  const data = activities ?? []
  const isEmpty = data.length === 0

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
    <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 space-y-3 flex-shrink-0">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Activity Feed
      </h3>
      <div className="space-y-2.5">
        {isEmpty ? (
          <p className="text-xs text-slate-500 py-2">
            {emptyMessage ?? 'No activity yet. Opens and replies will appear here.'}
          </p>
        ) : (
          data.map((activity, index) => (
            <div
              key={`${activity.type}-${activity.timestamp}-${index}`}
              className="flex items-start gap-3 rounded-lg border border-slate-200/50 bg-white/50 px-3 py-2"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {getActivityLabel(activity.type)}
                  {activity.prospectName ? ` · ${activity.prospectName}` : ''}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[activity.timestamp, activity.description].filter(Boolean).join(' · ')}
                </p>
              </div>
              {activity.type === 'email_opened' && (
                <div className="flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
