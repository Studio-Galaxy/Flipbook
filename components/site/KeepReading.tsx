"use client";

import Link from "next/link";
import { useLast } from "@/lib/progress";
import { subjectBy } from "@/lib/library";

// Only appears once a book has been opened on this device.
export function KeepReading() {
  const last = useLast();
  const s = last && subjectBy(last.subject);
  const book = s?.books[last!.cls];
  if (!s || !book) return null;
  return (
    <Link
      href={`/${s.slug}/${last!.cls}`}
      className="group mt-12 inline-flex items-center gap-4 rounded-full bg-paper py-2.5 pl-2.5 pr-6 ring-1 ring-line transition-colors hover:bg-cream-2"
    >
      <span className="grid size-11 place-items-center rounded-full text-[15px] font-semibold text-cream" style={{ background: s.colour }}>
        {last!.cls}
      </span>
      <span>
        <span className="label block text-ink-2">Keep reading</span>
        <span className="text-[16px] font-medium tracking-[-0.02em]">
          {s.name} · Class {last!.cls} — {book.title}
        </span>
      </span>
      <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
    </Link>
  );
}
