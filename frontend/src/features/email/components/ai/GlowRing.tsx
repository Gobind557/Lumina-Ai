import { ReactNode } from "react";

export type AIState = "idle" | "generating" | "suggested" | "applied";

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
      case "generating":
        return 0.7;
      case "suggested":
        return 1;
      case "applied":
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
      case "generating":
        return `0 0 30px rgba(59, 130, 246, ${
          opacity * 0.5
        }), 0 0 60px rgba(147, 51, 234, ${opacity * 0.4})`;
      case "suggested": {
        const conf = confidence ?? 0.5;
        return `0 0 40px rgba(59, 130, 246, ${
          0.5 + conf * 0.3
        }), 0 0 80px rgba(147, 51, 234, ${0.3 + conf * 0.2})`;
      }
      case "applied": {
        const conf = confidence ?? 0.5;
        return `0 0 30px rgba(16, 185, 129, ${
          0.35 + conf * 0.25
        }), 0 0 70px rgba(124, 58, 237, ${0.25 + conf * 0.15})`;
      }
      default:
        return "none";
    }
  };

  const opacity = getGlowOpacity();
  const boxShadow = getBoxShadow();
  const shouldAnimate =
    aiState === "generating" || aiState === "suggested";
  const animationClass =
    aiState === "suggested"
      ? "animate-pulse-glow-strong"
      : "animate-pulse-glow";

  return (
    <div
      className={`relative flex w-full min-h-0 flex-1 flex-col rounded-xl p-[2px] transition-all duration-500 ${
        shouldAnimate ? animationClass : ""
      }`}
      style={{
        background: `linear-gradient(135deg, rgba(59, 130, 246, ${opacity}), rgba(147, 51, 234, ${opacity}))`,
        boxShadow: boxShadow,
      }}
    >
      {/* Inner content wrapper — bounded height so compose scrolls instead of clipping */}
      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl">
        {children}
      </div>

      {/* Confidence Badge (when suggestion ready) */}
      {(aiState === "suggested" || aiState === "applied") && confidence !== undefined && (
        <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-lg animate-fade-in">
          {Math.round(confidence * 100)}%
        </div>
      )}
    </div>
  );
}
