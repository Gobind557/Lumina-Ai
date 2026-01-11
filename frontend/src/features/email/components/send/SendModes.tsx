import { useState, useRef, useEffect } from "react";
import { Send, Clock, List } from "lucide-react";

export type SendMode = "send_now" | "send_at_best_time" | "add_to_sequence";

interface SendModesProps {
  onSendModeChange?: (mode: SendMode) => void;
  defaultMode?: SendMode;
}

export default function SendModes({
  onSendModeChange,
  defaultMode = "send_at_best_time",
}: SendModesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<SendMode>(defaultMode);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleModeSelect = (mode: SendMode) => {
    setSelectedMode(mode);
    onSendModeChange?.(mode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-lg"
      >
        <Send className="w-4 h-4" />
        Send
        <span className="text-xs opacity-75">▼</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-fade-in">
          <div className="p-2">
            <div
              onClick={() => handleModeSelect("send_now")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                selectedMode === "send_now"
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  selectedMode === "send_now"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {selectedMode === "send_now" ? (
                  <div className="w-5 h-5 rounded border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
                )}
              </div>
              <Send className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900 flex-1">Send now</span>
            </div>

            <div
              onClick={() => handleModeSelect("send_at_best_time")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                selectedMode === "send_at_best_time"
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  selectedMode === "send_at_best_time"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {selectedMode === "send_at_best_time" ? (
                  <div className="w-5 h-5 rounded border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
                )}
              </div>
              <Clock className="w-4 h-4 text-gray-600" />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-gray-900">Send at best time</span>
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  Formal
                </span>
              </div>
            </div>

            <div
              onClick={() => handleModeSelect("add_to_sequence")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                selectedMode === "add_to_sequence"
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50 opacity-60"
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  selectedMode === "add_to_sequence"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {selectedMode === "add_to_sequence" ? (
                  <div className="w-5 h-5 rounded border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
                )}
              </div>
              <List className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900 flex-1">
                Add to sequence
              </span>
              <span className="text-xs text-gray-400">→</span>
            </div>
          </div>

          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
                CMD
              </kbd>{" "}
              +{" "}
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
                ENTER
              </kbd>{" "}
              to Send
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
