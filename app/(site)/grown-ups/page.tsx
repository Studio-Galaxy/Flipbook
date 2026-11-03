import type { Metadata } from "next";
import { Readout } from "@/components/site/Readout";
import { Rise } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Pill";

export const metadata: Metadata = {
  title: "For grown-ups",
  description: "What Flipbook is, who made it, where the books come from, and exactly what it stores. In plain words.",
};

const FACTS = [
  ["What it is", "Flipbook is a demo library made by Studio Galaxy, a development studio. It shows how our Flipbook SDK turns a publisher’s book into one children enjoy opening."],
  ["Where the books come from", "Every book comes from a real publisher, is credited to them, and is added only with their permission. Classes with no book yet say “Arriving soon”."],
  ["What it isn’t", "It isn’t a school, a course or a replacement for a teacher. There are no tests, scores or rankings."],
  ["Who to ask", "Questions about Flipbook go to the people who built it: hello@studiogalaxy.org. Questions about a book’s content go to its publisher."],
];

const PRIVACY = [
  ["No accounts", "Nobody signs up. We never ask for a name, an email, an age or a school."],
  ["No cookies", "Flipbook sets none."],
  ["No analytics or ads", "No tracking tools, no advertising, no third-party scripts."],
  ["Only reading places saved", "The last book opened, the page you’re on, your bookmarks and light or dark reading, so you can pick up where you left off. They stay in this browser and never reach us."],
];

export default function GrownUps() {
  return (
    <main>
      <section className="px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44 lg:px-16">
        <p className="label mb-6 text-ink-2">Flipbook · For grown-ups</p>
        <h1 className="display max-w-[12ch] text-[clamp(2.9rem,8.4vw,8.4rem)]">
          Plain answers<span className="text-violet">.</span>
        </h1>
        <p className="mt-8 max-w-xl text-[clamp(1.15rem,1.6vw,1.45rem)] leading-snug tracking-[-0.02em] text-ink-2">
          What Flipbook is, who made it, and exactly what it does with your child’s time on it.
        </p>
      </section>

      <section aria-label="About Flipbook" className="px-5 md:px-10 lg:px-16">
        <dl className="border-t border-line">
          {FACTS.map(([q, a]) => (
            <div key={q} className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:py-10">
              <dt className="text-[clamp(1.3rem,2.2vw,1.9rem)] font-semibold tracking-[-0.04em] md:col-span-5">{q}</dt>
              <dd className="text-[16px] leading-relaxed text-ink-2 md:col-span-7 md:text-[17px]">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-24 px-5 py-24 md:px-10 md:py-36 lg:px-16">
        <div className="grid gap-8 md:grid-cols-12">
          <p className="label text-ink-2 md:col-span-3">Privacy</p>
          <Rise className="md:col-span-9">
            <h2 id="privacy-title" className="display text-[clamp(2.4rem,5.6vw,5.6rem)]">
              Nothing to hide.
              <br />
              <span className="text-ink-3">Check it yourself.</span>
            </h2>
          </Rise>
        </div>
        <ul className="mt-16 grid gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line md:mt-24 md:grid-cols-2">
          {PRIVACY.map(([title, text]) => (
            <li key={title} className="bg-cream p-7 md:p-9">
              <p className="text-[22px] font-semibold tracking-[-0.03em]">{title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Readout />
        </div>
      </section>

      <section aria-labelledby="cta-title" className="px-5 pb-24 md:px-10 md:pb-36 lg:px-16">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="cta-title" className="display max-w-[16ch] text-[clamp(2rem,4.2vw,4rem)]">
            A school, a platform or a publisher<span className="text-violet">?</span>
          </h2>
          <Pill href="https://studiogalaxy.org/#contact">Talk to Studio Galaxy</Pill>
        </div>
      </section>
    </main>
  );
}
