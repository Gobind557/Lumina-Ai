import { Lock } from "lucide-react";

interface TemplateDetailsFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  tone: "normal" | "casual";
  onToneChange: (value: "normal" | "casual") => void;
}

const CATEGORIES = ["Follow-Up", "Cold Outreach", "Announcement", "LinkedIn Connection", "Humor"];

export default function TemplateDetailsForm({
  title,
  onTitleChange,
  category,
  onCategoryChange,
  tone,
  onToneChange,
}: TemplateDetailsFormProps) {
  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-xl p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />
      <div className="relative z-10">
      <h3 className="text-lg font-semibold text-white mb-1">Template Details</h3>
      <p className="text-sm text-gray-400 mb-6">
        Provide your template details below to categorize and personalize it effectively.
      </p>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Value-Based Follow-Up"
            className="w-full px-4 py-2.5 bg-slate-800/50 border border-blue-800/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full appearance-none bg-slate-800/50 border border-blue-800/40 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Tone</label>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="range"
              min={0}
              max={100}
              value={tone === "normal" ? 30 : 70}
              onChange={(e) => onToneChange(Number(e.target.value) < 50 ? "normal" : "casual")}
              className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tone"
                checked={tone === "normal"}
                onChange={() => onToneChange("normal")}
                className="border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              Normal
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tone"
                checked={tone === "casual"}
                onChange={() => onToneChange("casual")}
                className="border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              Casual
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Adjust the tone to be more formal or casual for this template.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
