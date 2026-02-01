import { useState, useRef, useEffect } from "react";
import { Send, Clock, ChevronDown } from "lucide-react";
import type { SendMode } from "./SendModes";

interface SendModesPanelProps {
  selectedMode?: SendMode;
  onModeChange?: (mode: SendMode) => void;
  tone?: "formal" | "casual";
  onToneChange?: (tone: "formal" | "casual") => void;
}

export default function SendModesPanel({
  selectedMode = "send_at_best_time",
  onModeChange,
  tone = "casual",
  onToneChange,
}: SendModesPanelProps) {
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const toneDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toneDropdownRef.current &&
        !toneDropdownRef.current.contains(event.target as Node)
      ) {
        setIsToneDropdownOpen(false);
      }
    };

    if (isToneDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isToneDropdownOpen]);

  const handleToneSelect = (selectedTone: "formal" | "casual") => {
    onToneChange?.(selectedTone);
    setIsToneDropdownOpen(false);
  };
  return (
    <div className="glass-card p-4 space-y-3 flex-shrink-0">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
        Send Modes
      </h3>

      <div className="space-y-2.5">
        {/* Send now */}
        <button
          onClick={() => onModeChange?.("send_now")}
          className="w-full flex items-center gap-3 hover:bg-slate-200/60 rounded-lg p-2.5 transition-colors"
        >
          <div className="flex-shrink-0">
            {selectedMode === "send_now" ? (
              <div className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-indigo-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-indigo-400"></div>
            )}
          </div>
          <Send className="w-4 h-4 text-slate-700" />
          <span className="text-sm text-slate-700 flex-1 text-left">Send now</span>
        </button>

        {/* Send at best time */}
        <div className="w-full flex items-center gap-3 hover:bg-slate-200/60 rounded-lg p-2.5 transition-colors">
          <button
            onClick={() => onModeChange?.("send_at_best_time")}
            className="flex items-center gap-3 flex-1"
          >
            <div className="flex-shrink-0">
              {selectedMode === "send_at_best_time" ? (
                <div className="w-5 h-5 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-indigo-400"></div>
              )}
            </div>
            <Clock className="w-4 h-4 text-slate-700" />
            <span className="text-sm text-slate-700 flex-1 text-left">
              Send at best time
            </span>
          </button>
          {selectedMode === "send_at_best_time" && (
            <div className="relative flex-shrink-0" ref={toneDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsToneDropdownOpen(!isToneDropdownOpen);
                }}
                className="flex items-center gap-1 hover:bg-emerald-100/60 rounded-full px-2 py-0.5 transition-colors"
              >
                <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium border border-emerald-200">
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </span>
                <ChevronDown className="w-3 h-3 text-emerald-500" />
              </button>

              {/* Tone Options Popup */}
              {isToneDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-lg shadow-xl animate-fade-in overflow-hidden min-w-[120px]">
                  <div className="p-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToneSelect("casual");
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        tone === "casual"
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          tone === "casual"
                            ? "bg-emerald-400"
                            : "bg-transparent border border-emerald-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">Casual</span>
                      {tone === "casual" && (
                        <span className="ml-auto text-xs text-emerald-600">
                          ✓
                        </span>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToneSelect("formal");
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        tone === "formal"
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          tone === "formal"
                            ? "bg-emerald-400"
                            : "bg-transparent border border-emerald-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">Formal</span>
                      {tone === "formal" && (
                        <span className="ml-auto text-xs text-emerald-600">
                          ✓
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
