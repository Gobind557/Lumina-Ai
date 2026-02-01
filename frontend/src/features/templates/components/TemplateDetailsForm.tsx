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
    <div className="glass-card border border-slate-200/70 rounded-xl p-6 relative overflow-hidden">
      <div className="relative z-10">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Template Details</h3>
      <p className="text-sm text-slate-500 mb-6">
        Provide your template details below to categorize and personalize it effectively.
      </p>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Value-Based Follow-Up"
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/70 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full appearance-none bg-white/80 border border-slate-200/70 rounded-lg pl-4 pr-10 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-3">Tone</label>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="range"
              min={0}
              max={100}
              value={tone === "normal" ? 30 : 70}
              onChange={(e) => onToneChange(Number(e.target.value) < 50 ? "normal" : "casual")}
              className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tone"
                checked={tone === "normal"}
                onChange={() => onToneChange("normal")}
                className="border-slate-300 text-indigo-500 focus:ring-indigo-500"
              />
              Normal
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tone"
                checked={tone === "casual"}
                onChange={() => onToneChange("casual")}
                className="border-slate-300 text-indigo-500 focus:ring-indigo-500"
              />
              Casual
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Adjust the tone to be more formal or casual for this template.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
