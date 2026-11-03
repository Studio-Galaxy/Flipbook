// Line icons for the reader's toolbars: 20px, 1.7px strokes, currentColor.

const PATHS = {
  back: "M15 5l-7 7 7 7",
  prev: "M14.5 6l-6 6 6 6",
  next: "M9.5 6l6 6-6 6",
  panel: "M4 5h16v14H4zM9.5 5v14",
  minus: "M6 12h12",
  plus: "M12 6v12M6 12h12",
  bookmark: "M7 4h10v16l-5-4-5 4z",
  sound: "M5 10v4h3l4 4V6L8 10zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11",
  mute: "M5 10v4h3l4 4V6L8 10zM16 10l4 4M20 10l-4 4",
  spread: "M3 5.5h7.5c.8 0 1.5.7 1.5 1.5v12c0-.8-.7-1.5-1.5-1.5H3zM21 5.5h-7.5c-.8 0-1.5.7-1.5 1.5v12c0-.8.7-1.5 1.5-1.5H21z",
  sun: "M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z",
  moon: "M19.5 14.6A7.5 7.5 0 019.4 4.5a7.5 7.5 0 1010.1 10.1z",
  single: "M6 4h9l3 3v13H6z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, filled = false, className = "size-5" }: { name: IconName; filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  );
}
