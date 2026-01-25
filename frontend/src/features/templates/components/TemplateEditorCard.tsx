import { useState } from "react";
import { Sparkles, ChevronDown, HelpCircle } from "lucide-react";

interface TemplateEditorCardProps {
  content: string;
  onContentChange: (value: string) => void;
  status?: string;
  onCreateTemplate: () => void;
  submitLabel?: string;
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
  submitLabel = "Create Template",
  onImproveClarity,
  onChangeTone,
  onOptimizeReplies,
}: TemplateEditorCardProps) {
  const [saveStatus, setSaveStatus] = useState("All Changes Saved");

  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-xl p-6 shadow-2xl shadow-blue-500/20 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col flex-1">
      <h3 className="text-lg font-semibold text-white mb-1">Template Editor</h3>
      <p className="text-sm text-gray-400 mb-6">
        Craft your email template below. Use the AI tools to help you optimize the content.
      </p>

      <div className="flex items-center justify-between mb-4 px-3 py-2 bg-slate-800/30 rounded-xl border border-blue-800/30">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">{status}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        <button className="p-1 text-gray-400 hover:text-white">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="border border-blue-800/40 rounded-xl overflow-hidden bg-slate-800/20 mb-4">
        <div className="flex flex-wrap gap-1 p-2 border-b border-blue-800/40 bg-slate-800/30">
          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-blue-900/30 font-bold text-sm">
            B
          </button>
          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-blue-900/30 italic text-sm">
            I
          </button>
          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-blue-900/30">
            🔗
          </button>
          <span className="w-px bg-blue-800/50 self-stretch my-1" />
          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-blue-900/30">
            ≡
          </button>
          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-blue-900/30">
            ≡
          </button>
          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-blue-900/30">
            •
          </button>
          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-blue-900/30">
            1.
          </button>
          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-blue-900/30">
            ⋮
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => {
            onContentChange(e.target.value);
            setSaveStatus("Saving...");
            setTimeout(() => setSaveStatus("All Changes Saved"), 800);
          }}
          placeholder={DEFAULT_PLACEHOLDER}
          className="w-full min-h-[240px] p-4 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between px-4 py-2 border-t border-blue-800/30 text-xs text-gray-500">
          <span>{saveStatus}</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={onImproveClarity}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 rounded-lg text-sm text-blue-300 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Improve Clarity
        </button>
        <button
          onClick={onChangeTone}
          className="flex items-center gap-2 px-3 py-2 bg-blue-900/30 hover:bg-blue-900/40 border border-blue-700/40 rounded-lg text-sm text-gray-300 transition-colors"
        >
          Change Tone
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          onClick={onOptimizeReplies}
          className="flex items-center gap-2 px-3 py-2 bg-blue-900/30 hover:bg-blue-900/40 border border-blue-700/40 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Optimize for Replies
        </button>
      </div>

      <button
        onClick={onCreateTemplate}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 border border-blue-500/50 rounded-xl text-white font-medium shadow-lg shadow-blue-500/20 transition-colors"
      >
        {submitLabel}
      </button>
      </div>
    </div>
  );
}
