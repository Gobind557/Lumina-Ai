import { Sparkles, Theater, Scissors, Brain } from "lucide-react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AIActionBarProps {
  onPersonalize?: () => void;
  onToneChange?: (tone: "formal" | "casual") => void;
  onShorten?: () => void;
  onImprove?: () => void;
  currentTone?: "formal" | "casual";
  isGenerating?: boolean;
}

export default function AIActionBar({
  onPersonalize,
  onToneChange,
  onShorten,
  onImprove,
  currentTone = "casual",
  isGenerating = false,
}: AIActionBarProps) {
  const [tone, setTone] = useState<"formal" | "casual">(currentTone);

  const handleToneToggle = () => {
    const newTone = tone === "formal" ? "casual" : "formal";
    setTone(newTone);
    onToneChange?.(newTone);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-purple-50 border border-purple-100 rounded-lg shadow-sm transition-all duration-200">
      <button
        onClick={onPersonalize}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-70 disabled:hover:bg-purple-600"
      >
        {isGenerating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        {isGenerating ? "Generating…" : "✨ Personalize with AI"}
      </button>

      <div className="w-px h-6 bg-gray-300"></div>

      <button
        onClick={handleToneToggle}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-md transition-colors border border-purple-100 shadow-sm"
      >
        <Theater className="w-3.5 h-3.5" />
        <span>Change Tone</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
          {tone === "formal" ? "Formal" : "Casual"}
        </span>
      </button>

      <button
        onClick={onShorten}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-md transition-colors border border-purple-100 shadow-sm"
        title="Shorten"
      >
        <Scissors className="w-3.5 h-3.5" />
        Shorten
      </button>

      <button
        onClick={onImprove}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-md transition-colors border border-purple-100 shadow-sm"
        title="Improve clarity"
      >
        <Brain className="w-3.5 h-3.5" />
        Improve
      </button>
    </div>
  );
}
