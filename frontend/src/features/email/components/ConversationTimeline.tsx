import { Mail, Link as LinkIcon, MessageSquare, Clock } from 'lucide-react'

interface TimelineItem {
  type: 'reply' | 'link_clicked' | 'email_opened'
  timestamp: string
  relativeTime: string
  description?: string
}

interface ConversationTimelineProps {
  items?: TimelineItem[]
}

export default function ConversationTimeline({ items }: ConversationTimelineProps) {
  // Default data for MVP
  const defaultItems: TimelineItem[] = [
    { type: 'reply', timestamp: '2024-01-15T10:00:00Z', relativeTime: 'Yesterday' },
    { type: 'link_clicked', timestamp: '2024-01-16T09:40:00Z', relativeTime: '20 min ago' },
    { type: 'email_opened', timestamp: '2024-01-16T10:15:00Z', relativeTime: '5 min ago' },
  ]

  const data = items || defaultItems

  const getTimelineIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'reply':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
        )
      case 'link_clicked':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-blue-400" />
          </div>
        )
      case 'email_opened':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
            <Mail className="w-4 h-4 text-green-400" />
          </div>
        )
    }
  }

  const getTimelineLabel = (type: TimelineItem['type']) => {
    switch (type) {
      case 'reply':
        return 'Replied'
      case 'link_clicked':
        return 'Link clicked'
      case 'email_opened':
        return 'Email opened'
    }
  }

  return (
    <div className="bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-3 space-y-3 flex-shrink-0">
      <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
        Conversation Timeline
      </h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-800/40"></div>

        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="relative flex items-start gap-3">
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">{getTimelineIcon(item.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-medium text-white">{getTimelineLabel(item.type)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3 text-blue-300/70" />
                  <p className="text-xs text-blue-200">{item.relativeTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
