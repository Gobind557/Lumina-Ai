import { X, Sparkles } from "lucide-react";
import { useState } from "react";

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="glass-card p-4 flex items-center justify-between relative overflow-hidden">
      <div className="relative z-10 flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </div>
        <p className="text-sm text-slate-700 flex-1">
          Emails sent Tue 9-11am had{" "}
          <span className="font-semibold text-emerald-600">41% higher replies</span>{" "}
          this week
        </p>
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        className="relative z-10 p-1 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
