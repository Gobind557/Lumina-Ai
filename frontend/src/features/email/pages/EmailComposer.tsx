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
  const { draft, updateSubject, updateContent } = useEmailDraft(initialDraft);
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

  const handlePersonalize = () => {
    setAIState("thinking");
    setTimeout(() => {
      setAIState("suggestion_ready");
      setAIConfidence(0.87);
    }, 1500);
  };

  const handleToneChange = (newTone: "formal" | "casual") => {
    setTone(newTone);
    setAIState("thinking");
    setTimeout(() => {
      setAIState("suggestion_ready");
    }, 1000);
  };

  const handleShorten = () => {
    setAIState("thinking");
    setTimeout(() => {
      setAIState("suggestion_ready");
    }, 1000);
  };

  const handleImprove = () => {
    setAIState("thinking");
    setTimeout(() => {
      setAIState("suggestion_ready");
    }, 1000);
  };

  const handleOptimizeReply = () => {
    setAIState("thinking");
    setTimeout(() => {
      setAIState("suggestion_ready");
    }, 1000);
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
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl">
            {/* Subject Line */}
            <div className="flex-shrink-0 p-3 border-b border-slate-700/50">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
                Subject
              </label>
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => updateSubject(e.target.value)}
                placeholder="What's this email about?"
                className="w-full px-3 py-2.5 bg-slate-800/30 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all text-sm"
              />
            </div>

            {/* Email Body */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-shrink-0 px-3 pt-4 pb-3">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide">
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
                <div className="border-t border-slate-700/50 bg-slate-800/30 px-3 py-1.5 flex items-center gap-1 flex-wrap flex-shrink-0">
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-gray-300" />
                  </button>
                  <div className="w-px h-5 bg-slate-600/50 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4 text-gray-300" />
                  </button>
                  <div className="w-px h-5 bg-slate-600/50 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4 text-gray-300" />
                  </button>
                  <div className="w-px h-5 bg-slate-600/50 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Flag"
                  >
                    <Flag className="w-4 h-4 text-gray-300" />
                  </button>
                  <div className="w-px h-5 bg-slate-600/50 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0 p-3 border-t border-slate-700/50">
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
