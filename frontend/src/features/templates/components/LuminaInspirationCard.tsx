import { Lightbulb, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "luminaInspirationCollapsed";

interface LuminaInspirationCardProps {
  onSelect?: (content: string) => void;
}

const MOCK_TEMPLATES = [
  { label: "Founder outreach", content: "Hi [First Name],\n\nI've been following your work at [Company] and I'm really impressed by [Specific Project]..." },
  { label: "Product launch", content: "Hey [First Name],\n\nWe just launched [Product Name] and I'd love to get your feedback on how it could help [Company]..." },
  { label: "Follow-up after demo", content: "Hi [First Name],\n\nGreat chatting today! As promised, here are the details we discussed regarding [Feature]..." },
  { label: "Re-engagement", content: "Hi [First Name],\n\nIt's been a while since we last spoke. I wanted to share a new update that might be relevant to [Company]..." },
  { label: "Pricing update", content: "Hello [First Name],\n\nI wanted to personally reach out and let you know about some changes to our pricing structure..." }
];

export default function LuminaInspirationCard({ onSelect }: LuminaInspirationCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[28px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 leading-tight">Lumina Insights</h3>
        <button
          onClick={() => setIsCollapsed((current) => !current)}
          className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? "-rotate-90" : ""}`}
          />
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="mt-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 shadow-sm border border-amber-100 group cursor-pointer transition-transform hover:scale-105 active:scale-95">
            <Lightbulb className="w-7 h-7 text-amber-500 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-all" />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-6 px-1 font-medium">
            Get instant AI assistance drafting templates tailored to your specific goals.
          </p>
          
          <div className="relative w-full" ref={dropdownRef}>
            <button 
              onClick={() => setIsListOpen(!isListOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/70 hover:bg-white border border-slate-200/70 rounded-xl text-[11px] font-semibold text-slate-600 transition-all hover:shadow-sm"
            >
              <span>Review top templates</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isListOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isListOpen && (
              <div className="absolute z-50 top-full mt-2 w-full bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-slate-100 bg-slate-50/50 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Popular Picks</span>
                </div>
                {MOCK_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => {
                      onSelect?.(t.content);
                      setIsListOpen(false);
                      toast.success(`Applied ${t.label} template`);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[11px] text-slate-600 transition-colors hover:bg-indigo-50/50 hover:text-indigo-600 font-medium"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
