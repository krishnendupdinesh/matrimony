// A line-drawn flower made of two rings of petals.
// It takes its color from the text color you give it (currentColor),
// for example className="text-[var(--ivory)] opacity-30".
export default function Bloom({ className = "" }: { className?: string }) {
  const outerPetals = Array.from({ length: 12 }, (_, i) => i * 30);
  const innerPetals = Array.from({ length: 8 }, (_, i) => i * 45 + 22);

  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {outerPetals.map((angle) => (
        <ellipse
          key={`outer-${angle}`}
          cx="100"
          cy="52"
          rx="24"
          ry="46"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      {innerPetals.map((angle) => (
        <ellipse
          key={`inner-${angle}`}
          cx="100"
          cy="74"
          rx="16"
          ry="30"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="8" fill="currentColor" stroke="none" />
    </svg>
  );
}