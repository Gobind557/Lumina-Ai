import { ChevronDown, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TemplateDetailsFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  tone: "normal" | "casual";
  onToneChange: (value: "normal" | "casual") => void;
}

const CATEGORIES = ["Follow-Up", "Cold Outreach", "Announcement", "LinkedIn Connection", "Humor"];

export default function TemplateDetailsForm({
  title,
  onTitleChange,
  category,
  onCategoryChange,
  tone,
  onToneChange,
}: TemplateDetailsFormProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [toneValue, setToneValue] = useState(tone === "normal" ? 25 : 75);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToneChange = (val: number) => {
    setToneValue(val);
    onToneChange(val < 50 ? "normal" : "casual");
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[28px] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Template Details</h3>
      <p className="text-xs text-slate-500 mb-6">
        Provide details to categorize and personalize your template.
      </p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Value-Based Follow-Up"
            className="w-full px-4 py-3 bg-white/70 border border-slate-200/70 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400/40 transition-all"
          />
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Category</label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-white/70 border border-slate-200/70 rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            <span>{category}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onCategoryChange(c);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-indigo-50/50 ${
                    category === c ? "bg-indigo-50 text-indigo-600 font-medium" : "text-slate-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tone & Voice</label>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
              {toneValue < 50 ? "Professional" : "Friendly"}
            </span>
          </div>
          
          <div className="relative h-2 bg-slate-100 rounded-full mb-6 mx-1">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-200"
              style={{ width: `${toneValue}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={toneValue}
              onChange={(e) => handleToneChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-lg transition-transform duration-100 pointer-events-none"
              style={{ left: `calc(${toneValue}% - 10px)` }}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleToneChange(25)}
              className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-medium transition-all border ${
                toneValue < 50 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => handleToneChange(75)}
              className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-medium transition-all border ${
                toneValue >= 50 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Friendly
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 italic text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI will adjust vocabulary for this tone
          </p>
        </div>
      </div>
    </div>
  );
}
