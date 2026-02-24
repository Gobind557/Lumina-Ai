import { ExternalLink, ChevronDown, Flame, Mail } from "lucide-react";
import {
  useDashboardMomentum,
  useDashboardTimeline,
} from "../hooks/useDashboard";

function formatSentAt(sentAt: Date | string | null): string {
  if (!sentAt) return "—";
  const d = new Date(sentAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ContactActivity {
  name: string;
  activity: string;
  time: string;
  minutesAgo?: number;
  action: string;
  actionLabel: string;
  isHot?: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function MomentumCard() {
  const { momentum, loading } = useDashboardMomentum();
  const { timeline } = useDashboardTimeline(7);
  const recentEmails = (timeline?.emails ?? []).slice(0, 6);

  // Combine opens and replies, prioritize replies
  const activities: ContactActivity[] = momentum
    ? [
        ...momentum.replies.map((reply) => ({
          name: reply.prospectName,
          activity: reply.activity,
          time: reply.time,
          minutesAgo: reply.minutesAgo,
          action: "follow-up",
          actionLabel: "Follow Up",
          isHot: reply.isHot,
        })),
        ...momentum.opens
          .filter((open) => open.isHot)
          .map((open) => ({
            name: open.prospectName,
            activity: open.activity,
            time: open.time,
            minutesAgo: open.minutesAgo,
            action: "view",
            actionLabel: "View",
            isHot: open.isHot,
          })),
      ].slice(0, 10)
    : [];

  if (loading) {
    return (
      <div className="glass-card p-6 relative overflow-hidden h-full min-h-0 min-w-0 flex flex-col">
        <div className="relative z-10 flex flex-col h-full min-h-0">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Momentum
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-sm text-slate-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden h-full min-h-0 min-w-0 flex flex-col">
      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">Momentum</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1">
            View All
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Activities + Recent emails - scrollable list (scrollbar visible when content overflows) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4 overscroll-contain">
          {/* Activity (replies / opens) */}
          {activities.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">
              No recent activity
            </div>
          ) : (
            activities.map((activity, index) => {
              const isHot =
                activity.minutesAgo !== undefined && activity.minutesAgo < 10;
              const hasGlow = activity.isHot;
              return (
                <div key={index} className="flex items-start gap-3 relative">
                  {hasGlow && (
                    <div className="absolute -inset-1 bg-indigo-400/15 rounded-full blur-md animate-pulse-glow" />
                  )}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-sm font-semibold relative z-10 ${hasGlow ? "ring-2 ring-indigo-300/60" : ""}`}
                  >
                    {getInitials(activity.name)}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {activity.name}
                        </span>
                        {isHot && (
                          <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse-glow" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {activity.activity}
                    </p>
                    <button className="px-3 py-1.5 bg-white/80 hover:bg-white border border-slate-200/70 rounded-lg text-xs text-slate-700 transition-colors flex items-center gap-1">
                      {activity.actionLabel}
                      {activity.action === "view" && (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Recent emails */}
          {recentEmails.length > 0 && (
            <div className="pt-4 border-t border-slate-200/70">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Recent emails
              </h4>
              <ul className="space-y-1.5">
                {recentEmails.map((email) => (
                  <li
                    key={email.id}
                    className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100/80 last:border-0"
                  >
                    <span
                      className="text-slate-900 truncate flex-1"
                      title={email.subject}
                    >
                      {email.subject || "(No subject)"}
                    </span>
                    <span className="text-slate-500 shrink-0">
                      {email.prospectName || email.toEmail} ·{" "}
                      {formatSentAt(email.sentAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
