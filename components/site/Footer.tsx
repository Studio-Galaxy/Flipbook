import Link from "next/link";
import { Mark } from "./Mark";

export function Footer() {
  return (
    <footer className="px-5 pb-10 pt-10 md:px-10 lg:px-16">
      <div className="grid gap-10 border-t border-line pt-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="flex items-center gap-2.5">
            <Mark className="size-7" />
            <span className="text-[19px] font-semibold tracking-[-0.03em]">Flipbook</span>
          </p>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-2">
            A demo library by Studio Galaxy, made with our Flipbook SDK. No sign-up, no ads, no tracking.
          </p>
        </div>
        <ul className="space-y-2 text-[15px] md:col-span-3">
          <li><Link href="/" className="link-line">The library</Link></li>
          <li><Link href="/grown-ups" className="link-line">For grown-ups</Link></li>
          <li><Link href="/grown-ups#privacy" className="link-line">Privacy</Link></li>
        </ul>
        <div className="space-y-2 text-[15px] md:col-span-3">
          <a href="https://studiogalaxy.org/projects/flipbook" className="link-line block w-fit">The Flipbook SDK</a>
          <a href="https://studiogalaxy.org" className="link-line block w-fit text-ink-2">studiogalaxy.org</a>
        </div>
      </div>
      <p className="mt-16 text-[13px] text-ink-3">© 2026 Studio Galaxy · Books © their publishers</p>
    </footer>
  );
}
