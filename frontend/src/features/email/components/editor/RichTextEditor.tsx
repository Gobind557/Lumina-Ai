import { ChangeEvent, useMemo } from "react";
import { Lightbulb, Sparkles, Undo2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  aiScore?: number;
  aiSuggestion?: {
    label: string;
    before: string;
    after: string;
    confidence?: number;
    weakPhrases?: Array<{ text: string; hint: string }>;
  } | null;
  onApplySuggestion?: () => void;
  onRejectSuggestion?: () => void;
  onUndoSuggestion?: () => void;
  canUndo?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  aiScore,
  aiSuggestion,
  onApplySuggestion,
  onRejectSuggestion,
  onUndoSuggestion,
  canUndo = false,
}: RichTextEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const aiScorePct = useMemo(() => {
    const n = typeof aiScore === "number" ? aiScore : 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [aiScore]);

  const aiScoreTone = useMemo(() => {
    if (aiScorePct >= 80) return "green";
    if (aiScorePct >= 55) return "yellow";
    return "red";
  }, [aiScorePct]);

  return (
    <div
      className="flex-1 px-4 pt-6 pb-4 relative flex flex-col min-h-0 overflow-y-auto overflow-x-hidden bg-white/70 border border-slate-300/70 rounded-xl shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-purple-400/30 focus-within:border-purple-400/40"
    >
      {/* AI Score (top right) */}
      <div className="absolute top-3 right-3 z-10">
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/80 px-2 py-1 shadow-sm">
          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              aiScoreTone === "green"
                ? "bg-emerald-500"
                : aiScoreTone === "yellow"
                  ? "bg-amber-500"
                  : "bg-rose-500",
            ].join(" ")}
          />
          <span className="text-xs font-semibold text-slate-700">
            AI Score: {aiScorePct}/100
          </span>
        </div>
      </div>

      {/* Prominent AI Suggestion card */}
      {aiSuggestion ? (
        <div className="flex-shrink-0 mt-4 mb-4">
          <div className="rounded-lg bg-purple-50 border border-purple-100 px-3 py-2.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <div className="mt-0.5 rounded-md bg-white border border-purple-100 p-1">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    💡 AI Suggestion
                  </div>
                  <div className="text-xs text-slate-600">
                    {aiSuggestion.label}
                  </div>
                  {typeof aiSuggestion.confidence === "number" ? (
                    <div className="mt-1 text-[11px] text-slate-500">
                      Confidence:{" "}
                      <span className="font-semibold text-purple-700">
                        {Math.round(aiSuggestion.confidence * 100)}%
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {canUndo ? (
                  <button
                    type="button"
                    onClick={onUndoSuggestion}
                    className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors shadow-sm"
                  >
                    <Undo2 className="w-4 h-4" />
                    Undo
                  </button>
                ) : null}

                {!canUndo ? (
                  <div className="flex items-center gap-2">
                    {onRejectSuggestion ? (
                      <button
                        type="button"
                        onClick={onRejectSuggestion}
                        className="inline-flex items-center rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors shadow-sm"
                      >
                        Reject
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={onApplySuggestion}
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 transition-colors shadow-sm hover:shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Apply
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-md border border-purple-100 bg-white/70 p-2">
                <div className="text-[11px] font-semibold text-slate-600 mb-1">
                  Before
                </div>
                <div className="text-[12px] text-slate-700 whitespace-pre-wrap max-h-24 overflow-auto">
                  {aiSuggestion.before || "—"}
                </div>
              </div>
              <div className="rounded-md border border-purple-100 bg-purple-50/70 p-2">
                <div className="text-[11px] font-semibold text-slate-600 mb-1">
                  After
                </div>
                <div className="text-[12px] text-slate-900 whitespace-pre-wrap max-h-24 overflow-auto">
                  {aiSuggestion.after || "—"}
                </div>
              </div>
            </div>

            {aiSuggestion.weakPhrases?.length ? (
              <div className="mt-2 text-[11px] text-slate-600">
                Weak spots:{" "}
                {aiSuggestion.weakPhrases.map((p) => (
                  <span
                    key={p.text}
                    className="ml-1 underline decoration-yellow-300 underline-offset-4 cursor-help"
                    title={p.hint}
                  >
                    {p.text}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Hi James,&#10;&#10;I noticed from your recent LinkedIn post that you're focused on [insert personalized text here].&#10;&#10;I'd love to connect and discuss how our solutions can help you achieve your goals."
        className="w-full min-h-[200px] flex-1 bg-transparent text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed overflow-hidden"
      />

      {value && (
        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
          {value.length} characters
        </div>
      )}
    </div>
  );
}
