import Link from "next/link";
import { Mark } from "./Mark";

export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 md:px-6">
      <nav
        aria-label="Main"
        className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full bg-cream/95 py-2 pl-3 pr-2 shadow-[0_8px_24px_-18px_rgb(36_34_32/0.35)] ring-1 ring-line"
      >
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <Mark className="size-7" />
          <span className="text-[17px] font-semibold tracking-[-0.03em]">Flipbook</span>
          <span className="label hidden rounded-full bg-cream-2 px-2 py-1 text-[10px] text-ink-2 sm:inline">Demo</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/grown-ups"
            className="rounded-full px-3.5 py-2 text-[14px] text-ink-2 transition-colors duration-300 hover:bg-ink/5 hover:text-ink"
          >
            For grown-ups
          </Link>
          <a
            href="https://studiogalaxy.org"
            className="hidden rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-cream transition-colors hover:bg-black sm:inline-flex"
          >
            by Studio Galaxy ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
