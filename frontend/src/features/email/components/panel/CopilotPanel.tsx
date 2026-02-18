import { MoreVertical } from "lucide-react";
import ProspectInsights from "../insights/ProspectInsights";
import SendReadiness from "../insights/SendReadiness";
import SendModesPanel from "../send/SendModesPanel";
import ToneCard from "../ui/ToneCard";
import type { EmailDraft, Prospect } from "@/shared/types";
import type { SendMode } from "../send/SendModes";

interface CopilotPanelProps {
  draft: EmailDraft;
  prospect?: Prospect;
  isNewRecipient?: boolean;
  tone?: "formal" | "casual";
  sendMode?: SendMode;
  onToneChange?: (tone: "formal" | "casual") => void;
  onSendModeChange?: (mode: SendMode) => void;
}

export default function CopilotPanel({
  draft,
  prospect,
  isNewRecipient,
  tone = "casual",
  sendMode = "send_at_best_time",
  onToneChange,
  onSendModeChange,
}: CopilotPanelProps) {
  // Calculate metrics for Send Readiness
  const hasPersonalization =
    draft.content.toLowerCase().includes("james") ||
    draft.content.includes("[insert personalized text here]");

  const replyProbability = hasPersonalization ? 87 : 45;
  const personalizationStrength = hasPersonalization
    ? ("strong" as const)
    : ("weak" as const);

  return (
    <div className="w-80 bg-white/70 backdrop-blur-xl border-l border-slate-200/70 p-5 space-y-4 overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-900">The Copilot</h2>
        <button className="p-1.5 hover:bg-slate-200/70 rounded transition-colors">
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden min-h-0 flex flex-col space-y-4">
        <ProspectInsights prospect={prospect} isNewRecipient={isNewRecipient} />
        <SendReadiness replyProbability={replyProbability} spamRisk="low" />
        <ToneCard
          tone={tone}
          personalizationStrength={personalizationStrength}
          onToneChange={onToneChange}
        />
        <SendModesPanel
          selectedMode={sendMode}
          onModeChange={onSendModeChange}
          tone={tone}
          onToneChange={onToneChange}
        />
      </div>
    </div>
  );
}
