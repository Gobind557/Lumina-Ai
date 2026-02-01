import { Lightbulb, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "luminaInspirationCollapsed";

export default function LuminaInspirationCard() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="glass-card border border-slate-200/70 rounded-xl p-6 relative overflow-hidden">
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-slate-900">Need inspiration? Ask Lumina!</h3>
        <button
          onClick={() => setIsCollapsed((current) => !current)}
          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
          aria-expanded={!isCollapsed}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
          />
        </button>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mb-3">
            <Lightbulb className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Get assistance drafting your template tailored to your needs.
          </p>
          <div className="relative w-full">
            <button className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white/80 hover:bg-white border border-slate-200/70 rounded-lg text-sm text-slate-600 transition-colors">
              Review previous templates
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
