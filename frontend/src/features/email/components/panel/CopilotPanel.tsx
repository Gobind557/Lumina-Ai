import { Building2, Sparkles, Wand2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import ProspectInsights from "../insights/ProspectInsights";
import SendReadiness from "../insights/SendReadiness";
import SendModesPanel from "../send/SendModesPanel";
import ToneCard from "../ui/ToneCard";
import type { EmailDraft, Prospect } from "@/shared/types";
import type { SendMode } from "../send/SendModes";
import { useEffect, useMemo, useState } from "react";
import type { AIState } from "../ai/GlowRing";
import { buildCopilotReadinessState } from "../../utils/engagementMetrics";

interface CopilotPanelProps {
  draft: EmailDraft;
  prospect?: Prospect;
  /** Name / company from the compose “To” row — updates metrics before prospect is saved */
  recipientName?: string;
  recipientCompany?: string;
  isNewRecipient?: boolean;
  tone?: "formal" | "casual";
  sendMode?: SendMode;
  onToneChange?: (tone: "formal" | "casual") => void;
  onSendModeChange?: (mode: SendMode) => void;
  onApplyAISuggestion?: (suggestionId: "personalize" | "subject" | "company") => void;
  aiState?: AIState;
}

export default function CopilotPanel({
  draft,
  prospect,
  recipientName,
  recipientCompany,
  isNewRecipient,
  tone = "casual",
  sendMode = "send_at_best_time",
  onToneChange,
  onSendModeChange,
  onApplyAISuggestion,
  aiState = "idle",
}: CopilotPanelProps) {
  /** Debounce body text so Reply Likelihood / hints don’t jitter every keystroke. */
  const [debouncedBody, setDebouncedBody] = useState(draft.content);
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedBody(draft.content), 400);
    return () => window.clearTimeout(t);
  }, [draft.content]);

  const engagement = useMemo(
    () =>
      buildCopilotReadinessState(
        { ...draft, content: debouncedBody },
        prospect,
        {
          recipientName,
          recipientCompany,
        },
      ),
    [
      debouncedBody,
      draft.subject,
      prospect?.id,
      prospect?.name,
      prospect?.company,
      recipientName,
      recipientCompany,
    ],
  );
  const {
    replyLikelihood,
    personalizationStrength,
    hintTitle,
    hintDetail,
    footnote,
    hasPersonalization,
    subjectIsPresent,
    hasCompanyMention,
  } = engagement;

  const [appliedId, setAppliedId] = useState<
    "personalize" | "subject" | "company" | null
  >(null);

  useEffect(() => {
    if (!appliedId) return;
    const t = window.setTimeout(() => setAppliedId(null), 1300);
    return () => window.clearTimeout(t);
  }, [appliedId]);

  return (
    <div className="flex lg:h-full min-h-[400px] lg:min-h-0 w-full lg:w-80 flex-col space-y-4 lg:overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl shrink-0">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-900">The Copilot</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto">
        <ProspectInsights prospect={prospect} isNewRecipient={isNewRecipient} />

        {/* AI Suggestions */}
        <div className="rounded-xl border border-purple-100 bg-purple-50/80 p-4 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">AI Suggestions</h3>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded-full px-2 py-0.5">
              Click to apply
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setAppliedId("personalize");
                onApplyAISuggestion?.("personalize");
              }}
              disabled={aiState === "generating"}
              className={[
                "w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 border transition-colors",
                appliedId === "personalize"
                  ? "bg-white border-purple-200"
                  : "bg-white/50 hover:bg-white border-transparent hover:border-purple-100",
              ].join(" ")}
            >
              <span className="mt-0.5 rounded-md bg-white border border-purple-200 p-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  Add personalization line
                </span>
                <span className="block text-xs text-slate-600">
                  {aiState === "generating" && appliedId === "personalize"
                    ? "Generating…"
                    : hasPersonalization
                      ? "Looks personalized — refine the opener."
                      : "Improves reply likelihood with a tailored opener."}
                </span>
              </span>
              {aiState === "generating" && appliedId === "personalize" ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => {
                setAppliedId("subject");
                onApplyAISuggestion?.("subject");
              }}
              disabled={aiState === "generating"}
              className={[
                "w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 border transition-colors",
                appliedId === "subject"
                  ? "bg-white border-purple-200"
                  : "bg-white/50 hover:bg-white border-transparent hover:border-purple-100",
              ].join(" ")}
            >
              <span className="mt-0.5 rounded-md bg-white border border-purple-200 p-1">
                <Wand2 className="w-4 h-4 text-purple-600" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  Improve subject
                </span>
                <span className="block text-xs text-slate-600">
                  {aiState === "generating" && appliedId === "subject"
                    ? "Generating…"
                    : subjectIsPresent
                      ? "Subject looks good — make it more compelling."
                      : "Generate a stronger subject line for opens."}
                </span>
              </span>
              {aiState === "generating" && appliedId === "subject" ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => {
                setAppliedId("company");
                onApplyAISuggestion?.("company");
              }}
              disabled={aiState === "generating"}
              className={[
                "w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 border transition-colors",
                appliedId === "company"
                  ? "bg-white border-purple-200"
                  : "bg-white/50 hover:bg-white border-transparent hover:border-purple-100",
              ].join(" ")}
            >
              <span className="mt-0.5 rounded-md bg-white border border-purple-200 p-1">
                <Building2 className="w-4 h-4 text-purple-600" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  Mention company
                </span>
                <span className="block text-xs text-slate-600">
                  {aiState === "generating" && appliedId === "company"
                    ? "Generating…"
                    : hasCompanyMention
                      ? "Company is mentioned — add stronger context."
                      : "Reference their context to sound more relevant."}
                </span>
              </span>
              {aiState === "generating" && appliedId === "company" ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              ) : null}
            </button>
          </div>
        </div>

        <SendReadiness
          replyProbability={replyLikelihood}
          spamRisk="low"
          hintTitle={hintTitle}
          hintDetail={hintDetail}
          footnote={footnote}
        />
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
