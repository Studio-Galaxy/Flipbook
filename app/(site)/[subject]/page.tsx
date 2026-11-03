import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cover } from "@/components/book/Cover";
import { CLASSES, deep, subjectBy, subjects, tint } from "@/lib/library";

type Props = { params: Promise<{ subject: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => subjects.map((s) => ({ subject: s.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = subjectBy((await params).subject);
  return { title: s ? s.name : undefined, description: s && `${s.line} Books for Class 1 to Class 8.` };
}

const SHADE = [0, 12, 4, 18, 8, 22, 14, 26]; // % of black mixed in, so neighbouring covers differ

export default async function SubjectPage({ params }: Props) {
  const s = subjectBy((await params).subject);
  if (!s) notFound();
  const others = subjects.filter((o) => o.slug !== s.slug);

  return (
    <main className="relative isolate px-5 pb-24 pt-28 md:px-10 md:pb-36 md:pt-36 lg:px-16">
      {/* the subject's light, a fixed height: viewport units would resize it as phone browsers' bars move */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[760px]" style={{ background: `linear-gradient(${tint(s)}, var(--color-cream))` }} />
      <Link href="/" className="group inline-flex items-center gap-2 text-[15px] text-ink-2">
        <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-1">←</span>
        <span className="link-line">All subjects</span>
      </Link>
      <p className="label mt-10 text-ink-2">{s.name} · Class 1 to 8</p>
      <h1 className="display mt-5 text-[clamp(2.8rem,7.6vw,7.6rem)]">
        {s.name}<span style={{ color: s.colour }}>.</span>
      </h1>
      <p className="mt-6 max-w-xl text-[clamp(1.1rem,1.5vw,1.35rem)] leading-snug tracking-[-0.02em] text-ink-2">
        {s.line} Choose your class.
      </p>

      <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:mt-20 md:gap-x-6 lg:grid-cols-4">
        {CLASSES.map((cls) => {
          const b = s.books[cls];
          const cover = (
            <Cover
              background={b ? deep(s, SHADE[cls - 1]) : "var(--color-paper)"}
              index={s.symbol}
              label="Class"
              symbol={String(cls)}
              title={b ? b.title : "Arriving soon"}
              sub={b ? b.publisher : "On its way to the library"}
              muted={!b}
            />
          );
          return (
            <li key={cls}>
              {b ? (
                <Link
                  href={`/${s.slug}/${cls}`}
                  className="group block rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                >
                  {cover}
                  <p className="mt-4 text-[14px] text-ink-2 md:text-[15px]">
                    Class {cls}
                    {b.pageCount ? ` · ${b.pageCount} pages` : ""}
                  </p>
                </Link>
              ) : (
                <div aria-label={`Class ${cls}: arriving soon`}>
                  {cover}
                  <p className="mt-4 text-[14px] text-ink-3 md:text-[15px]">Class {cls}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-10 max-w-xl text-[15px] leading-relaxed text-ink-2">
        We only add books from real publishers, with their permission. Classes marked “Arriving soon” don’t have one yet.
      </p>

      <nav aria-label="Other subjects" className="mt-24 md:mt-32">
        <p className="label text-ink-2">Other subjects</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/${o.slug}`}
                className="inline-flex items-center gap-2.5 rounded-full bg-cream-2 py-1.5 pl-1.5 pr-4 text-[15px] transition-colors hover:bg-lilac"
              >
                <span aria-hidden className="grid size-7 place-items-center rounded-[7px] text-[11px] font-semibold tracking-[-0.02em] text-cream" style={{ background: o.colour }}>
                  {o.symbol}
                </span>
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
