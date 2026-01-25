import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LiveConversationTimeline() {
  const [activeTab, setActiveTab] = useState<"today" | "replies" | "closed">("today");

  // Sample data for the chart
  const chartData = [
    { day: "Mon", blue: 50, purple: 60 },
    { day: "Tue", blue: 80, purple: 90 },
    { day: "Wed", blue: 120, purple: 110 },
    { day: "Thu", blue: 100, purple: 130 },
    { day: "Fri", blue: 150, purple: 140 },
    { day: "Sat", blue: 130, purple: 160 },
    { day: "Sun", blue: 180, purple: 170 },
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-blue-700/50 rounded-lg p-3 shadow-xl min-w-[200px]">
          <p className="text-sm font-semibold text-white mb-1">W:R Yeang</p>
          <p className="text-xs text-gray-300 mb-1">Opened 5m yesterday</p>
          <p className="text-xs text-blue-400 mb-1">13 Replies from Sarah Mitchell</p>
          <p className="text-xs text-gray-400">Top template: Cold Outreach</p>
        </div>
      );
    }
    return null;
  };

  // Custom dot component for data points
  const CustomDot = (props: any) => {
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

  // Custom tick for X-axis to highlight "Tue"
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const isTue = payload.value === "Tue";
    return (
      <text
        x={x}
        y={y}
        dy={16}
        textAnchor="middle"
        fill={isTue ? "#60a5fa" : "#9ca3af"}
        fontSize={12}
        fontWeight={isTue ? 600 : 400}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
      {/* Enhanced Glassmorphic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Live Conversation Timeline</h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "today"
                ? "bg-blue-600 text-white"
                : "bg-blue-900/20 text-gray-300 hover:bg-blue-900/30"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab("replies")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "replies"
                ? "bg-blue-600 text-white"
                : "bg-blue-900/20 text-gray-300 hover:bg-blue-900/30"
            }`}
          >
            Replies
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "closed"
                ? "bg-purple-600 text-white"
                : "bg-blue-900/20 text-gray-300 hover:bg-blue-900/30"
            }`}
          >
            Closed
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
          </button>
        </div>

        {/* Chart */}
        <div className="relative" style={{ height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="rgba(30, 58, 138, 0.2)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={<CustomXAxisTick />}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                domain={[0, 200]}
                ticks={[0, 50, 100, 150, 200]}
                tickMargin={8}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#60a5fa", strokeWidth: 1, strokeDasharray: "5 5" }}
              />
              <Line
                type="monotone"
                dataKey="blue"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={<CustomDot fill="#60a5fa" />}
                activeDot={{ r: 6, fill: "#60a5fa" }}
                style={{ filter: "drop-shadow(0 4px 6px rgba(96, 165, 250, 0.3))" }}
              />
              <Line
                type="monotone"
                dataKey="purple"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={<CustomDot fill="#a78bfa" />}
                activeDot={{ r: 6, fill: "#a78bfa" }}
                style={{ filter: "drop-shadow(0 4px 6px rgba(167, 139, 250, 0.3))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
