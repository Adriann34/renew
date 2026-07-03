export function GpuMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 90"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="10" width="152" height="60" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="3" fill="currentColor" />
      <circle cx="100" cy="40" r="20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="40" r="3" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <line
            key={`l-${i}`}
            x1={40 + Math.cos(angle) * 6}
            y1={40 + Math.sin(angle) * 6}
            x2={40 + Math.cos(angle) * 17}
            y2={40 + Math.sin(angle) * 17}
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <line
            key={`r-${i}`}
            x1={100 + Math.cos(angle) * 6}
            y1={40 + Math.sin(angle) * 6}
            x2={100 + Math.cos(angle) * 17}
            y2={40 + Math.sin(angle) * 17}
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
      <line x1="130" y1="10" x2="130" y2="0" stroke="currentColor" strokeWidth="1.5" />
      <line x1="138" y1="10" x2="138" y2="0" stroke="currentColor" strokeWidth="1.5" />
      <rect x="0" y="76" width="30" height="6" fill="currentColor" />
      <rect x="34" y="76" width="18" height="6" fill="currentColor" />
    </svg>
  );
}
