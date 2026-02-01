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
    <div className="glass-card p-4 h-full flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between flex-shrink-0 mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h3>
          <button className="p-1 text-slate-400 hover:text-slate-700 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm text-slate-900 mb-1 break-words">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="whitespace-nowrap">{task.time}</span>
                  {task.reschedule && (
                    <span className="text-indigo-600 whitespace-nowrap">
                      {task.reschedule}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors flex-shrink-0 mt-2">
          View All Tasks
        </button>
      </div>
    </div>
  );
}
