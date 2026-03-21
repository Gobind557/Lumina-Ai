const BRAND_PURPLE = "#7B4DFF";

export type LuminaLogoVariant = "light" | "dark";

export interface LuminaLogoProps {
  className?: string;
  /** Height in px; width scales with wordmark. */
  height?: number;
  variant?: LuminaLogoVariant;
}

/**
 * Lumina AI wordmark: purple squircle + sparkle + “Lumina AI”.
 * Use variant `light` on pale surfaces, `dark` on dark hero areas.
 */
export default function LuminaLogo({
  className,
  height = 40,
  variant = "light",
}: LuminaLogoProps) {
  const luminaFill = variant === "light" ? "#0f172a" : "#ffffff";
  const aiFill = variant === "light" ? "#94a3b8" : "#a1a1aa";

  const w = Math.round(height * (188 / 40));

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 188 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Lumina AI"
    >
      <title>Lumina AI</title>
      <rect x="2" y="2" width="32" height="32" rx="10" fill={BRAND_PURPLE} />
      <path
        fill="#ffffff"
        d="M18 8.5 19.6 16.1 27.5 18 19.6 19.9 18 27.5 16.4 19.9 8.5 18 16.4 16.1 18 8.5z"
      />
      <text
        x="44"
        y="27"
        fontFamily="system-ui, -apple-system, Segoe UI, Inter, sans-serif"
        fontSize="20"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        <tspan fill={luminaFill}>Lumina</tspan>
        <tspan fill={aiFill}> AI</tspan>
      </text>
    </svg>
  );
}
