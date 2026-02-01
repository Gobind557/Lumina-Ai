import { useState, useRef, useEffect } from "react";
import { FileText, Smile, ChevronRight } from "lucide-react";

interface ToneCardProps {
  tone?: "formal" | "casual";
  personalizationStrength?: "weak" | "moderate" | "strong";
  onToneChange?: (tone: "formal" | "casual") => void;
}

export default function ToneCard({
  tone = "casual",
  personalizationStrength = "strong",
  onToneChange,
}: ToneCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToneSelect = (selectedTone: "formal" | "casual") => {
    onToneChange?.(selectedTone);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Second Card: Tone & Personalization */}
      <div className="glass-card p-4 space-y-3 flex-shrink-0">
        {/* Tone */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between hover:bg-slate-200/60 rounded-lg px-2 py-2 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-sm text-slate-700">Tone</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-sm text-slate-900">
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </div>
        </button>

        {/* Personalization */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Smile className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-slate-700">Personalization</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-emerald-600">
              {personalizationStrength.charAt(0).toUpperCase() +
                personalizationStrength.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Popup Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-lg shadow-xl animate-fade-in overflow-hidden">
          <div className="p-1.5">
            <button
              onClick={() => handleToneSelect("casual")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                tone === "casual"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  tone === "casual"
                    ? "bg-indigo-400"
                    : "bg-transparent border border-indigo-400"
                }`}
              ></div>
              <span className="text-sm font-medium">Casual</span>
              {tone === "casual" && (
                <span className="ml-auto text-xs text-indigo-600">✓</span>
              )}
            </button>

            <button
              onClick={() => handleToneSelect("formal")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                tone === "formal"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  tone === "formal"
                    ? "bg-indigo-400"
                    : "bg-transparent border border-indigo-400"
                }`}
              ></div>
              <span className="text-sm font-medium">Formal</span>
              {tone === "formal" && (
                <span className="ml-auto text-xs text-indigo-600">✓</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
