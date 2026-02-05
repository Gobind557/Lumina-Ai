import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Flag,
  List,
  ListOrdered,
} from "lucide-react";
import {
  CopilotPanel,
  RichTextEditor,
  GlowRing,
  AIActionBar,
  SendModes,
  type AIState,
  type SendMode,
} from "../components";
import { useEmailDraft } from "../hooks";
import { apiRequest } from "@/shared/utils";
import { API_ENDPOINTS } from "@/shared/constants";
import { MOCK_TEMPLATES } from "../../templates/data/mockTemplates";
import type { EmailDraft } from "../../../shared/types";

export default function EmailComposer() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId");
  const initialDraft = useMemo<EmailDraft | undefined>(() => {
    if (!templateId) return undefined;
    const template = MOCK_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return undefined;
    const now = new Date();
    return {
      id: template.id,
      subject: template.title,
      content: template.description,
      createdAt: now,
      updatedAt: now,
    };
  }, [templateId]);
  const { draft, updateSubject, updateContent, saveDraftNow } =
    useEmailDraft(initialDraft);
  const [aiState, setAIState] = useState<AIState>("idle");
  const [aiConfidence, setAIConfidence] = useState<number>(0.87);
  const [sendMode, setSendMode] = useState<SendMode>("send_at_best_time");
  const [tone, setTone] = useState<"formal" | "casual">("casual");

  // Mock AI suggestions for demo
  const suggestions = [
    {
      id: "1",
      start: 0,
      end: 0,
      text: "[insert personalized text here]",
      confidence: 0.87,
    },
  ];

  const handlePersonalize = async () => {
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      const prospectId =
        draft.prospectId ||
        (typeof window !== "undefined"
          ? localStorage.getItem("default_prospect_id")
          : null);
      if (!draftId || !prospectId) return;
      const response = await apiRequest<{
        suggestion: { subject?: string; body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_PERSONALIZE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          prospect_id: prospectId,
          tone,
        }),
      });
      if (response.suggestion?.subject) {
        updateSubject(response.suggestion.subject);
      }
      if (response.suggestion?.body) {
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  const handleToneChange = async (newTone: "formal" | "casual") => {
    setTone(newTone);
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      if (!draftId) return;
      const response = await apiRequest<{
        suggestion: { subject?: string; body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction: `Rewrite in a ${newTone} tone.`,
        }),
      });
      if (response.suggestion?.subject) {
        updateSubject(response.suggestion.subject);
      }
      if (response.suggestion?.body) {
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  const handleShorten = async () => {
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      if (!draftId) return;
      const response = await apiRequest<{
        suggestion: { body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction: "Make it more concise.",
        }),
      });
      if (response.suggestion?.body) {
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  const handleImprove = async () => {
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      if (!draftId) return;
      const response = await apiRequest<{
        suggestion: { body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction: "Improve clarity and readability.",
        }),
      });
      if (response.suggestion?.body) {
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  const handleOptimizeReply = async () => {
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      if (!draftId) return;
      const response = await apiRequest<{
        suggestion: { body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction: "Optimize for higher replies.",
        }),
      });
      if (response.suggestion?.body) {
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  // const handleSuggestionAccept = (_suggestionId: string) => {
  //   // Handle suggestion acceptance
  //   setAIState("idle");
  // };

  const handleSendModeChange = (mode: SendMode) => {
    setSendMode(mode);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Composer Area */}
      <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden min-h-0">
        {/* Card Container with Glow Ring */}
        <GlowRing aiState={aiState} confidence={aiConfidence}>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden glass-card border border-slate-200/70 shadow-[0_20px_60px_rgba(99,102,241,0.12)]">
            {/* Subject Line */}
            <div className="flex-shrink-0 p-3 border-b border-slate-200/70">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Subject
              </label>
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => updateSubject(e.target.value)}
                placeholder="What's this email about?"
                className="w-full px-3 py-2.5 bg-white/80 border border-slate-200/70 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-sm"
              />
            </div>

            {/* Email Body */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-shrink-0 px-3 pt-4 pb-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Message
                </label>
              </div>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <RichTextEditor
                  value={draft.content}
                  onChange={updateContent}
                  suggestions={suggestions}
                />

                {/* AI Action Bar */}
                <div className="flex-shrink-0 px-3 pb-2">
                  <AIActionBar
                    onPersonalize={handlePersonalize}
                    onToneChange={handleToneChange}
                    onShorten={handleShorten}
                    onImprove={handleImprove}
                    onOptimizeReply={handleOptimizeReply}
                    currentTone={tone}
                  />
                </div>

                {/* Toolbar */}
                <div className="border-t border-slate-200/70 bg-white/70 px-3 py-1.5 flex items-center gap-1 flex-wrap flex-shrink-0">
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Flag"
                  >
                    <Flag className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0 p-3 border-t border-slate-200/70">
              <SendModes
                onSendModeChange={handleSendModeChange}
                defaultMode={sendMode}
              />
            </div>
          </div>
        </GlowRing>
      </div>

      {/* Copilot Panel */}
      <CopilotPanel
        draft={draft}
        tone={tone}
        sendMode={sendMode}
        onToneChange={handleToneChange}
        onSendModeChange={handleSendModeChange}
      />
    </div>
  );
}
