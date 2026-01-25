import { X, Sparkles } from "lucide-react";
import { useState } from "react";

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-4 flex items-center justify-between shadow-lg shadow-blue-500/20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      
      <div className="relative z-10 flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <p className="text-sm text-white flex-1">
          Emails sent Tue 9-11am had <span className="font-semibold text-green-400">41% higher replies</span> this week
        </p>
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        className="relative z-10 p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
