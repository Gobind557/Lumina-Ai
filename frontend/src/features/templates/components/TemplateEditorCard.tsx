import { useState } from "react";
import { Sparkles, ChevronDown, HelpCircle, Loader2, Check } from "lucide-react";

interface TemplateEditorCardProps {
  content: string;
  onContentChange: (value: string) => void;
  status?: string;
  onCreateTemplate: () => void;
  onImproveClarity?: () => void;
  onChangeTone?: () => void;
  onOptimizeReplies?: () => void;
}

const DEFAULT_PLACEHOLDER = `Hi [First Name],

[Draft your email template content here...]

Best regards,
[Your Name]`;

export default function TemplateEditorCard({
  content,
  onContentChange,
  status = "Draft: Untitled Template",
  onCreateTemplate,
  onImproveClarity,
  onChangeTone,
  onOptimizeReplies,
}: TemplateEditorCardProps) {
  const [saveStatus, setSaveStatus] = useState("All changes saved");
  const isSaving = saveStatus === "Saving...";

  return (
    <div className="glass-card border border-slate-200/70 rounded-xl p-6 flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col flex-1">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Template Editor</h3>
      <p className="text-sm text-slate-500 mb-6">
        Craft your email template below. Use the AI tools to help you optimize the content.
      </p>

      <div className="flex items-center justify-between mb-4 px-3 py-2 bg-white/70 rounded-xl border border-slate-200/70">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">{status}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xs text-slate-500">Drafts are auto-saved</span>
        </div>
        <button className="p-1 text-slate-400 hover:text-slate-700">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="border border-slate-200/70 rounded-xl overflow-hidden bg-white/60 mb-4">
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200/70 bg-white/70">
          <button className="p-2 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold text-sm">
            B
          </button>
          <button className="p-2 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 italic text-sm">
            I
          </button>
          <button className="p-2 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            🔗
          </button>
          <span className="w-px bg-slate-200 self-stretch my-1" />
          <button className="p-2 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            ≡
          </button>
          <button className="p-2 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            ≡
          </button>
          <button className="p-2 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            •
          </button>
          <button className="p-2 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            1.
          </button>
          <button className="p-2 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            ⋮
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => {
            onContentChange(e.target.value);
            setSaveStatus("Saving...");
            setTimeout(() => setSaveStatus("All changes saved"), 800);
          }}
          placeholder={DEFAULT_PLACEHOLDER}
          className="w-full min-h-[240px] p-4 bg-transparent text-slate-900 placeholder-slate-400 resize-none focus:outline-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200/70 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {saveStatus}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={onImproveClarity}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500/15 hover:bg-indigo-500/20 border border-indigo-200/70 rounded-lg text-sm text-indigo-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Improve Clarity
        </button>
        <button
          onClick={onChangeTone}
          className="flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white border border-slate-200/70 rounded-lg text-sm text-slate-600 transition-colors"
        >
          Change Tone
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          onClick={onOptimizeReplies}
          className="flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white border border-slate-200/70 rounded-lg text-sm text-slate-600 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Optimize for Replies
        </button>
      </div>

      <button
        onClick={onCreateTemplate}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/20 transition-colors"
      >
        Create Template
      </button>
      </div>
    </div>
  );
}
