import { CheckCircle2, MoreHorizontal } from "lucide-react";

interface Task {
  id: string;
  title: string;
  time: string;
  reschedule?: string;
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Call Emily from TechNova about meeting times",
    time: "today in 1:00 AM",
    reschedule: "→ 11:00 AM",
  },
  {
    id: "2",
    title: "Follow up with Sarah at GreenTech",
    time: "huora 2 hours",
  },
  {
    id: "3",
    title: "Follow up with Matt at SuiteWorks",
    time: "3 days ago",
  },
];

export default function UpcomingTasksCard() {
  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-4 h-full flex flex-col shadow-2xl shadow-blue-500/20 relative overflow-hidden">
      {/* Enhanced Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between flex-shrink-0 mb-3">
          <h3 className="text-lg font-semibold text-white">Upcoming Tasks</h3>
          <button className="p-1 text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm text-white mb-1 break-words">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                  <span className="whitespace-nowrap">{task.time}</span>
                  {task.reschedule && (
                    <span className="text-blue-400 whitespace-nowrap">
                      {task.reschedule}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0 mt-2">
          View All Tasks
        </button>
      </div>
    </div>
  );
}
