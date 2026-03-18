import { useState } from "react";
import { Clock, Send } from "lucide-react";

export type SendMode = "send_now" | "send_at_best_time" | "add_to_sequence";

interface SendModesProps {
  onSendModeChange?: (mode: SendMode) => void;
  onSend?: () => void;
  defaultMode?: SendMode;
}

export default function SendModes({
  onSendModeChange,
  onSend,
  defaultMode = "send_at_best_time",
}: SendModesProps) {
  const [selectedMode, setSelectedMode] = useState<SendMode>(defaultMode);

  const handleModeSelect = (mode: SendMode) => {
    setSelectedMode(mode);
    onSendModeChange?.(mode);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-2">
        <button
          onClick={onSend}
          className="flex-1 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors duration-200 flex items-center gap-2 text-sm rounded-lg shadow-sm hover:shadow-md"
        >
          <Send className="w-4 h-4" />
          Send Now
        </button>

        <div className="flex-1 flex flex-col">
          <button
            type="button"
            onClick={() => handleModeSelect("send_at_best_time")}
            className={[
              "w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 shadow-sm",
              selectedMode === "send_at_best_time"
                ? "bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100"
                : "bg-white hover:bg-purple-50 border-purple-200 text-purple-700",
            ].join(" ")}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule Send
            </div>
          </button>
          <div className="mt-1 text-[11px] text-slate-500 text-center px-1.5">
            Best time: Tomorrow 9:30 AM
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
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
  );
}
