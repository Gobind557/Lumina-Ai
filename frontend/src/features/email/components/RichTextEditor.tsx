import { ChangeEvent, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import WhyAISuggestion from "./WhyAISuggestion";

interface AISuggestion {
  id: string;
  start: number;
  end: number;
  text: string;
  confidence: number;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: AISuggestion[];
  onSuggestionAccept?: (suggestionId: string) => void;
}

export default function RichTextEditor({
  value,
  onChange,
  suggestions = [],
  onSuggestionAccept,
}: RichTextEditorProps) {
  const [activeSuggestion, setActiveSuggestion] = useState<AISuggestion | null>(
    null
  );

  useEffect(() => {
    // Check if there's a suggestion in the text
    const suggestion = suggestions.find((s) => value.includes(s.text));
    if (suggestion && value.includes("[insert personalized text here]")) {
      setActiveSuggestion(suggestion);
    } else {
      setActiveSuggestion(null);
    }
  }, [value, suggestions]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleAcceptSuggestion = () => {
    if (activeSuggestion) {
      // Replace placeholder with actual suggestion text
      const newValue = value.replace(
        activeSuggestion.text,
        activeSuggestion.text.replace(
          "[insert personalized text here]",
          "scaling your sales team"
        )
      );
      onChange(newValue);
      onSuggestionAccept?.(activeSuggestion.id);
    }
  };

  // Check if there's a suggestion placeholder in the text
  const hasSuggestionPlaceholder = value.includes(
    "[insert personalized text here]"
  );

  return (
    <div className="flex-1 px-4 pt-6 pb-4 relative flex flex-col min-h-0">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Hi James,&#10;&#10;I noticed from your recent LinkedIn post that you're focused on [insert personalized text here].&#10;&#10;I'd love to connect and discuss how our solutions can help you achieve your goals."
        className="w-full flex-1 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed"
      />

      {/* AI Suggestion Indicator */}
      {hasSuggestionPlaceholder && (
        <div className="absolute top-3 right-3 flex items-center gap-2 animate-fade-in z-10">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-300 rounded-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="text-xs font-medium text-blue-800">
              AI Suggestion Available
            </span>
          </div>
          <button
            onClick={handleAcceptSuggestion}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Accept
          </button>
        </div>
      )}

      {/* Why AI Suggestion */}
      {hasSuggestionPlaceholder && activeSuggestion && (
        <div className="absolute bottom-16 left-5 right-5 z-10">
          <WhyAISuggestion confidence={activeSuggestion.confidence} />
        </div>
      )}

      {value && (
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {value.length} characters
        </div>
      )}
    </div>
  );
}
