/** Gamppa (village basket) icon – modern line style SVG */
export function GampaIcon({ className = 'w-6 h-6', strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* basket rim */}
      <ellipse cx="12" cy="9" rx="9" ry="3" />
      {/* basket body */}
      <path d="M3 9c0 0 1.5 10 9 10s9-10 9-10" />
      {/* weave lines */}
      <path d="M6 12c2 3 8 3 12 0" opacity="0.5" />
      {/* handle */}
      <path d="M8 9c0-4 8-4 8 0" />
    </svg>
  );
}
