import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardTimeline } from "../hooks/useDashboard";
import { useDashboardFilters } from "../../../shared/context/DashboardFilterContext";

export default function LiveConversationTimeline() {
  const { weekOffset } = useDashboardFilters();
  // Fetch several weeks so the header "This Week" filter can jump between 7‑day windows.
  const { timeline, loading } = useDashboardTimeline(42);

  const allChartData =
    timeline?.timeline.map((d) => ({
      day: d.day,
      opens: d.opens,
      replies: d.replies,
    })) ?? [];

  // Derive a 7‑day window from the end of the full timeline, shifted by the header weekOffset.
  const DAYS_PER_WEEK = 7;
  const totalPoints = allChartData.length;
  const endIndex = Math.max(0, totalPoints - DAYS_PER_WEEK * weekOffset);
  const startIndex = Math.max(0, endIndex - DAYS_PER_WEEK);
  const chartData = allChartData.slice(startIndex, endIndex);

  // Tooltip reads from chartData by day so it always matches the graph (Recharts payload can show wrong values)
  const CustomTooltip = ({
    active,
    label,
  }: {
    active?: boolean;
    payload?: unknown[];
    label?: string;
  }) => {
    if (!active || !label) return null;
    const point = chartData.find((d) => d.day === label);
    const opens = point?.opens ?? 0;
    const replies = point?.replies ?? 0;
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-lg p-3 shadow-xl min-w-[160px]">
        <p className="text-xs font-medium text-slate-700 mb-1">{label}</p>
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Opens:</span> {opens}
        </p>
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Replies:</span> {replies}
        </p>
      </div>
    );
  };

  const CustomDot = (props: { cx?: number; cy?: number; fill?: string }) => {
    const { cx, cy, fill } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fill || "#60a5fa"}
        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" }}
      />
    );
  };

  if (loading) {
    return (
      <div className="glass-card p-6 relative overflow-hidden h-full min-h-0 flex flex-col">
        <div className="relative z-10 h-full min-h-0 flex flex-col">
          <div className="h-6 w-48 bg-slate-200/60 rounded animate-pulse mb-4" />
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-20 bg-slate-200/60 rounded-lg animate-pulse"
              />
            ))}
          </div>
          <div className="h-[220px] lg:flex-1 lg:min-h-[150px] bg-slate-100/50 rounded-lg animate-pulse" />
          <div className="mt-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-200/60 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden h-full min-h-0 flex flex-col">
      <div className="relative z-10 h-full min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Live Conversation Timeline
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/15 border border-emerald-400/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600 font-medium">LIVE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3 lg:mb-4">
          <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#60a5fa]" aria-hidden />
            Open
          </span>
          <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#a78bfa]" aria-hidden />
            Replies
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="relative h-[190px] lg:flex-1 lg:min-h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="rgba(148, 163, 184, 0.35)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  allowDecimals={false}
                  tickMargin={8}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#94a3b8",
                    strokeWidth: 1,
                    strokeDasharray: "5 5",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="opens"
                  name="Opens"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={<CustomDot fill="#60a5fa" />}
                  activeDot={{ r: 6, fill: "#60a5fa" }}
                  style={{
                    filter: "drop-shadow(0 4px 6px rgba(96, 165, 250, 0.3))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="replies"
                  name="Replies"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={<CustomDot fill="#a78bfa" />}
                  activeDot={{ r: 6, fill: "#a78bfa" }}
                  style={{
                    filter: "drop-shadow(0 4px 6px rgba(167, 139, 250, 0.3))",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[190px] lg:flex-1 lg:min-h-[130px] flex items-center justify-center text-sm text-slate-500 rounded-lg bg-slate-50/50">
            No timeline data for the last 7 days
          </div>
        )}

        {/* Recent emails - commented out
        {recentEmails.length > 0 && (
          <div className="mt-6 border-t border-slate-200/70 pt-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Recent emails</h4>
            <ul className="space-y-2">
              {recentEmails.map((email) => (
                <li
                  key={email.id}
                  className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span className="text-slate-900 truncate flex-1" title={email.subject}>
                    {email.subject || "(No subject)"}
                  </span>
                  <span className="text-slate-500 shrink-0">
                    {email.prospectName || email.toEmail} · {formatSentAt(email.sentAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        */}
      </div>
    </div>
  );
}
