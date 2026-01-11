import { ReactNode } from "react";

export type AIState = "idle" | "thinking" | "suggestion_ready";

interface GlowRingProps {
  children: ReactNode;
  aiState: AIState;
  confidence?: number;
}

export default function GlowRing({
  children,
  aiState,
  confidence,
}: GlowRingProps) {
  const getGlowOpacity = () => {
    switch (aiState) {
      case "idle":
        return 0.4;
      case "thinking":
        return 0.7;
      case "suggestion_ready":
        return 1;
      default:
        return 0.4;
    }
  };

  const getBoxShadow = () => {
    const opacity = getGlowOpacity();
    switch (aiState) {
      case "idle":
        return `0 0 20px rgba(59, 130, 246, ${
          opacity * 0.3
        }), 0 0 40px rgba(147, 51, 234, ${opacity * 0.2})`;
      case "thinking":
        return `0 0 30px rgba(59, 130, 246, ${
          opacity * 0.5
        }), 0 0 60px rgba(147, 51, 234, ${opacity * 0.4})`;
      case "suggestion_ready": {
        const conf = confidence ?? 0.5;
        return `0 0 40px rgba(59, 130, 246, ${
          0.5 + conf * 0.3
        }), 0 0 80px rgba(147, 51, 234, ${0.3 + conf * 0.2})`;
      }
      default:
        return "none";
    }
  };

  const opacity = getGlowOpacity();
  const boxShadow = getBoxShadow();
  const shouldAnimate =
    aiState === "thinking" || aiState === "suggestion_ready";
  const animationClass =
    aiState === "suggestion_ready"
      ? "animate-pulse-glow-strong"
      : "animate-pulse-glow";

  return (
    <div
      className={`relative rounded-xl p-[2px] transition-all duration-500 ${
        shouldAnimate ? animationClass : ""
      }`}
      style={{
        background: `linear-gradient(135deg, rgba(59, 130, 246, ${opacity}), rgba(147, 51, 234, ${opacity}))`,
        boxShadow: boxShadow,
      }}
    >
      {/* Inner content wrapper */}
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        {children}
      </div>

      {/* Confidence Badge (when suggestion ready) */}
      {aiState === "suggestion_ready" && confidence !== undefined && (
        <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-lg animate-fade-in">
          {Math.round(confidence * 100)}%
        </div>
      )}
    </div>
  );
}
