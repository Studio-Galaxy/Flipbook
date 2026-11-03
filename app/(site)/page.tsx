import Link from "next/link";
import { Cover } from "@/components/book/Cover";
import { KeepReading } from "@/components/site/KeepReading";
import { Rise } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Pill";
import { subjects } from "@/lib/library";

const STEPS = [
  ["Pick a subject.", "Twelve subjects, from Maths to Music."],
  ["Choose your class.", "One book for every class, 1 to 8."],
  ["Turn the pages.", "Real pages, like a real book."],
];

const PROMISES = [
  ["No sign-up", "There are no accounts. Nobody asks for a name or an email."],
  ["No ads", "Nothing is sold here, and nothing pops up."],
  ["No tracking", "No cookies, no analytics, no third-party scripts."],
  ["Real books", "Every book is credited to the publisher who made it."],
];

export default function Home() {
  return (
    <main>
      <section id="top" className="relative overflow-x-clip px-5 pb-24 pt-32 md:px-10 md:pb-36 md:pt-44 lg:px-16">
        <p className="label anim-fade mb-8 text-ink-2 md:mb-10" style={{ animationDelay: "0.5s" }}>
          Flipbook — A library for young readers
        </p>
        <h1 className="display text-[clamp(3.1rem,10.4vw,10.5rem)]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="anim-rise block">Every book</span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span className="anim-rise block" style={{ animationDelay: "0.12s" }}>
              is a{" "}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="anim-sweep absolute inset-x-[-0.04em] bottom-[0.06em] top-[0.46em] -z-10 rounded-[0.08em] bg-lavender"
                  style={{ animationDelay: "0.75s" }}
                />
                door.
              </span>
            </span>
          </span>
        </h1>
        <div className="anim-fade mt-14 flex items-end justify-between gap-6 border-t border-line pt-5" style={{ animationDelay: "0.9s" }}>
          <p className="max-w-[20rem] text-[15px] leading-snug text-ink-2 md:max-w-none md:text-[17px]">
            Twelve subjects. Class 1 to 8. Real pages to turn.
          </p>
          <a href="#subjects" className="group flex shrink-0 items-center gap-2 text-[15px] font-medium md:text-[17px]">
            <span className="link-line">Pick a subject</span>
            <span aria-hidden className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-y-1">↓</span>
          </a>
        </div>
        <KeepReading />

        <div id="subjects" className="scroll-mt-28 pt-20 md:pt-32">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {subjects.map((s, i) => (
              <li key={s.slug}>
                <Link
                  href={`/${s.slug}`}
                  className="group block rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                >
                  <Cover background={s.colour} index={String(i + 1).padStart(2, "0")} label="Class 1–8" symbol={s.symbol} title={s.name} />
                  <p className="mt-3 text-[14px] leading-snug text-ink-2 md:text-[15px]">{s.line}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="how-title" className="px-5 py-24 md:px-10 md:py-36 lg:px-16">
        <div className="grid gap-8 md:grid-cols-12">
          <p className="label text-ink-2 md:col-span-3">How it works</p>
          <Rise className="md:col-span-9">
            <h2 id="how-title" className="display text-[clamp(2.4rem,5.6vw,5.6rem)]">
              Three steps.
              <br />
              <span className="text-ink-3">Then you’re reading.</span>
            </h2>
          </Rise>
        </div>
        <ol className="mt-16 grid gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line md:mt-24 md:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="bg-cream p-7 md:p-9">
              <p className="font-mono text-[11px] text-violet">{`0${i + 1}`}</p>
              <p className="mt-4 text-[22px] font-semibold tracking-[-0.03em]">{title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="trust-title" className="px-5 pb-24 md:px-10 md:pb-36 lg:px-16">
        <div className="rounded-[40px] bg-paper p-7 ring-1 ring-line md:p-14">
          <div className="grid gap-8 md:grid-cols-12">
            <p className="label text-ink-2 md:col-span-3">For grown-ups</p>
            <div className="md:col-span-9">
              <h2 id="trust-title" className="display text-[clamp(2rem,4.2vw,4rem)]">
                A safe place to read<span className="text-violet">.</span>
              </h2>
              <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {PROMISES.map(([title, text]) => (
                  <li key={title}>
                    <p className="text-[18px] font-semibold tracking-[-0.02em]">{title}</p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{text}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <Pill href="/grown-ups">How Flipbook works</Pill>
                <Link href="/grown-ups#privacy" className="link-line text-[15px] text-ink-2">
                  See what’s stored on this device
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
