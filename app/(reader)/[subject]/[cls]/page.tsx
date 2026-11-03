import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reader } from "@/components/reader/Reader";
import { CLASSES, subjectBy, subjects } from "@/lib/library";

type Props = { params: Promise<{ subject: string; cls: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  subjects.flatMap((s) => CLASSES.map((c) => ({ subject: s.slug, cls: String(c) })));

async function find(params: Props["params"]) {
  const p = await params;
  const s = subjectBy(p.subject);
  const cls = Number(p.cls);
  return s && CLASSES.includes(cls) ? { s, cls, book: s.books[cls] } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await find(params);
  if (!f) return {};
  return { title: f.book ? `${f.book.title} · ${f.s.name} Class ${f.cls}` : `${f.s.name} Class ${f.cls}` };
}

export default async function Read({ params }: Props) {
  const f = await find(params);
  if (!f) notFound();
  const { s, cls, book } = f;

  if (!book)
    return (
      <main className="grid min-h-[100svh] place-items-center px-6 text-center">
        <div>
          <p className="label" style={{ color: s.colour }}>
            {s.name} · Class {cls}
          </p>
          <h1 className="display mt-5 text-[clamp(2.4rem,6vw,5rem)]">
            Arriving soon<span style={{ color: s.colour }}>.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-snug text-ink-2">
            We only add books from real publishers, with their permission. This one isn’t here yet.
          </p>
          <Link href={`/${s.slug}`} className="mt-10 inline-flex rounded-full bg-ink px-7 py-4 text-[15px] font-medium text-cream hover:bg-black">
            Back to {s.name}
          </Link>
        </div>
      </main>
    );

  const next = CLASSES.find((c) => c > cls && s.books[c]);
  return (
    <Reader
      key={`${s.slug}/${cls}`} // a fresh reader per book: its own download, page and bookmarks
      book={{
        url: `/api/book/${s.slug}/${cls}`, // signs a short-lived R2 link: the bucket stays private
        title: book.title,
        publisher: book.publisher,
        cls,
        subject: { slug: s.slug, name: s.name, symbol: s.symbol, colour: s.colour },
        pageAspect: book.pageAspect,
        pageCount: book.pageCount,
        chapters: book.chapters ?? [],
        next: next ? { label: `Read Class ${next}`, href: `/${s.slug}/${next}` } : undefined,
      }}
    />
  );
}
