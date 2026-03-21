import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Lightbulb, Sparkles, Undo2 } from "lucide-react";
import type { InlineHighlight } from "../../utils/generateSuggestions";

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
  /** Inline weak spots (Grammarly-style) on the writing surface */
  inlineHighlights?: InlineHighlight[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

function severityClasses(severity: InlineHighlight["severity"]): string {
  switch (severity) {
    case "high":
      return "bg-[rgba(255,200,0,0.22)] border-b-2 border-orange-500 rounded-sm";
    case "medium":
      return "bg-[rgba(255,220,120,0.18)] border-b-2 border-amber-500/90 rounded-sm";
    default:
      return "bg-[rgba(255,235,150,0.15)] border-b border-amber-400/60 rounded-sm";
  }
}

function buildHighlightedHtml(text: string, highlights: InlineHighlight[]): string {
  if (!text) return "<br />";

  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  let cursor = 0;
  let html = "";

  for (const h of sorted) {
    const start = Math.max(0, Math.min(h.start, text.length));
    const end = Math.max(start, Math.min(h.end, text.length));
    if (start < cursor) continue;
    if (start > text.length) break;

    html += escapeHtml(text.slice(cursor, start));
    const slice = text.slice(start, end);
    const cls = severityClasses(h.severity);
    html += `<span class="${cls}" title="${escapeAttr(h.title)}">${escapeHtml(slice)}</span>`;
    cursor = end;
  }

  html += escapeHtml(text.slice(cursor));
  return html || "<br />";
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
  inlineHighlights = [],
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef(value);
  const [focused, setFocused] = useState(false);

  const highlightsKey = useMemo(
    () => JSON.stringify(inlineHighlights),
    [inlineHighlights],
  );

  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const externalEdit = value !== lastEmittedRef.current;
    // While the user is typing, the browser owns the DOM — don't replace HTML or the caret jumps.
    if (focused && !externalEdit) {
      return;
    }

    const html = buildHighlightedHtml(value, inlineHighlights);
    if (el.innerHTML !== html) {
      el.innerHTML = html;
    }
    lastEmittedRef.current = value;
  }, [value, highlightsKey, focused, inlineHighlights]);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    const plain = el.innerText.replace(/\u00a0/g, " ");
    lastEmittedRef.current = plain;
    onChange(plain);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const t = e.clipboardData.getData("text/plain");
    if (typeof document.execCommand === "function") {
      document.execCommand("insertText", false, t);
    } else {
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(t));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    handleInput();
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

  const showPlaceholder = !value.trim() && !focused;

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

      {/* AI suggestion: full before/after while pending; after apply, undo only */}
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
                {aiSuggestion.weakPhrases.map((p, i) => (
                  <span
                    key={`${p.text}-${i}`}
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
      ) : canUndo && onUndoSuggestion ? (
        <div className="flex-shrink-0 mt-4 mb-2">
          <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 shadow-sm flex items-center justify-between gap-3">
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Applied.</span> You can undo this
              change.
            </div>
            <button
              type="button"
              onClick={onUndoSuggestion}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50/80 transition-colors shadow-sm"
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative flex-1 min-h-[200px] flex flex-col">
        {showPlaceholder ? (
          <div className="pointer-events-none absolute left-0 top-0 z-[1] text-sm leading-relaxed text-slate-400 whitespace-pre-wrap pr-8">
            Hi James,{"\n\n"}
            I noticed from your recent LinkedIn post that you&apos;re focused on [insert
            personalized text here].{"\n\n"}
            I&apos;d love to connect and discuss how our solutions can help you achieve your
            goals.
          </div>
        ) : null}
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label="Email message body"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => {
            setFocused(true);
            const el = editorRef.current;
            if (!el || inlineHighlights.length === 0) return;
            el.textContent = value;
            lastEmittedRef.current = value;
          }}
          onBlur={() => {
            setFocused(false);
          }}
          className="relative z-[2] w-full min-h-[200px] flex-1 bg-transparent text-slate-900 text-sm leading-relaxed whitespace-pre-wrap break-words outline-none focus:ring-0 empty:min-h-[200px]"
        />
      </div>

      {value ? (
        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
          {value.length} characters
        </div>
      ) : null}
    </div>
  );
}
