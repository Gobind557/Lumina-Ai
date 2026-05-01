import { useState } from "react";
import { Clock, Send } from "lucide-react";
import { formatBestSendTimeHint } from "../../utils/bestSendTime";

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
    <div className="flex items-start gap-2">
      <button
        onClick={onSend}
        type="button"
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-purple-700 hover:shadow"
      >
        <Send className="h-3.5 w-3.5 shrink-0" />
        Send Now
      </button>

      <button
        type="button"
        onClick={() => handleModeSelect("send_at_best_time")}
        className={[
          "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold shadow-sm transition-colors duration-200",
          selectedMode === "send_at_best_time"
            ? "border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100"
            : "border-purple-200 bg-white text-purple-700 hover:bg-purple-50",
        ].join(" ")}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" />
        Schedule Send
      </button>
    </div>
  );
}
