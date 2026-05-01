import { useState, useRef } from "react";
import { 
  Sparkles, 
  ChevronDown, 
  HelpCircle, 
  Loader2, 
  Bold, 
  Italic, 
  Link2, 
  List, 
  ListOrdered, 
  Type
} from "lucide-react";
import { toast } from "sonner";

interface TemplateEditorCardProps {
  content: string;
  onContentChange: (value: string) => void;
  status?: string;
  onCreateTemplate: () => void;
  onImproveClarity?: () => void;
  onChangeTone?: () => void;
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
}: TemplateEditorCardProps) {
  const [saveStatus, setSaveStatus] = useState("All changes saved");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSaving = saveStatus === "Saving...";

  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
    onContentChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const simulateAiAction = async (action: string, callback?: () => void) => {
    setIsAiProcessing(true);
    toast.info(`AI is ${action}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAiProcessing(false);
    toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} completed`);
    callback?.();
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[28px] p-6 flex flex-col shadow-sm h-full">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Template Editor</h3>
      <p className="text-xs text-slate-500 mb-6">
        Craft your email template below. Use AI to optimize your conversion.
      </p>

      <div className="flex items-center justify-between mb-4 px-4 py-2.5 bg-white/50 rounded-xl border border-slate-200/50">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700">{status}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400">Drafts are auto-saved</span>
        </div>
        <HelpCircle className="w-4 h-4 text-slate-300 hover:text-slate-600 cursor-help" />
      </div>

      <div className="border border-slate-200/70 rounded-[20px] overflow-hidden bg-white/40 mb-5 shadow-sm">
        <div className="flex items-center gap-1 p-2 border-b border-slate-200/70 bg-white/50">
          <button 
            onClick={() => applyFormatting("**")}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            onClick={() => applyFormatting("*")}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button 
            onClick={() => applyFormatting("[", "](url)")}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button 
            onClick={() => applyFormatting("\n- ")}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            onClick={() => applyFormatting("\n1. ")}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            onContentChange(e.target.value);
            setSaveStatus("Saving...");
            setTimeout(() => setSaveStatus("All changes saved"), 800);
          }}
          placeholder={DEFAULT_PLACEHOLDER}
          className="w-full min-h-[220px] p-5 bg-transparent text-slate-900 placeholder-slate-400 resize-none focus:outline-none text-sm leading-relaxed"
        />
        
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200/70 text-[10px] text-slate-400">
          <span className="flex items-center gap-2">
            {isSaving ? (
              <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            )}
            {saveStatus}
          </span>
          <div className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            <span>{content.length} characters</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          disabled={isAiProcessing}
          onClick={() => simulateAiAction('improving clarity', onImproveClarity)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-all disabled:opacity-50"
        >
          {isAiProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Improve Clarity
        </button>
        <button
          disabled={isAiProcessing}
          onClick={() => simulateAiAction('analyzing tone', onChangeTone)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          Change Tone <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <button
        onClick={onCreateTemplate}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white text-sm font-semibold shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        Create Template
      </button>
    </div>
  );
}
