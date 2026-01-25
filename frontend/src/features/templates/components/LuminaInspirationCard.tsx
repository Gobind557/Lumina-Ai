import { Lightbulb, ChevronDown } from "lucide-react";

export default function LuminaInspirationCard() {
  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-xl p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />
      <div className="relative z-10">
      <h3 className="text-lg font-semibold text-white mb-1">Need inspiration? Ask Lumina!</h3>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
          <Lightbulb className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Get assistance drafting your template tailored to your needs.
        </p>
        <div className="relative w-full">
          <button className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800/70 border border-blue-700/40 rounded-lg text-sm text-gray-300 transition-colors">
            Review previous templates
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
