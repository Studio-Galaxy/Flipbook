// Flipbook's mark: an open book on the Studio Galaxy tile, with the same violet dot.
export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect width="64" height="64" rx="16" fill="currentColor" />
      <path
        d="M13 23.5c7-3 13-2.2 19 2.5 6-4.7 12-5.5 19-2.5v21c-7-3-13-2.2-19 2.5-6-4.7-12-5.5-19-2.5z"
        fill="none"
        stroke="var(--color-cream)"
        strokeWidth="3.6"
        strokeLinejoin="round"
      />
      <path d="M32 26v20" stroke="var(--color-cream)" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="49" cy="14" r="5" fill="#9b7bff" />
    </svg>
  );
}
