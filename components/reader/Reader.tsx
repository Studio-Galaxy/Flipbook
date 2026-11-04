"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  SGFlipBook,
  argb,
  configurePdf,
  useFlipBookController,
  useFlipBookValue,
  type SGBookmark,
  type SGBookmarkRepository,
} from "@studio-galaxy/sg-flipbook/react";
import { cachedBook } from "@/lib/book-cache";
import { remember } from "@/lib/progress";
import { Icon, type IconName } from "./icons";

// The reading app. The SDK draws the pages and handles the PDF (streaming, rendering, jumps);
// everything here is the app around it: contents, bookmarks, toolbar, keys.

export type ReaderBook = {
  url: string;
  title: string;
  publisher: string;
  cls: number;
  subject: { slug: string; name: string; symbol: string; colour: string };
  pageAspect: number;
  pageCount?: number;
  chapters: { title: string; from: number }[];
  next?: { label: string; href: string };
};

// pdf.js legacy worker, to match the legacy library aliased in next.config.ts (older phones and Safari).
if (typeof window !== "undefined") {
  configurePdf({ workerSrc: new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString() });

  // Phones and tablets: draw pages and the curl at no more than 2× pixel density. A 3× screen (Galaxy S24,
  // iPhone Pro) otherwise shades and renders 2.25× the pixels every frame, and at arm's length 2× looks the same.
  // Desktop is untouched.
  // ponytail: patches window.devicePixelRatio, the only knob the SDK reads; move to an SDK option (maxPixelRatio) when it has one.
  const dpr = Object.getOwnPropertyDescriptor(window, "devicePixelRatio") ?? Object.getOwnPropertyDescriptor(Window.prototype, "devicePixelRatio");
  if (window.matchMedia("(pointer: coarse)").matches && dpr?.get) {
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => Math.min(2, dpr.get!.call(window)) });
  }
}

// The reader's accent: pink on cream, for every book.
const ACCENT = "#e0507c";

const LIGHT = {
  pageBackColor: argb(0xfff7f0e7),
  placeholderColor: argb(0xffefe6da),
  placeholderDotColor: argb(0x1f242220),
  curlShadowColor: argb(0x2e1b1428),
  spineShadowColor: argb(0x22000000),
  pageTurnDuration: 420,
};
const DARK = { ...LIGHT, placeholderColor: argb(0xff2a2a2a), placeholderDotColor: argb(0x26ffffff), curlShadowColor: argb(0x40000000), spineShadowColor: argb(0x30000000) };

// Saved on this device only: the page you're on, and your bookmarks.
const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};
function bookmarkStore(k: string): SGBookmarkRepository {
  const all = (): SGBookmark[] => {
    try {
      return JSON.parse(read(k) ?? "[]");
    } catch {
      return [];
    }
  };
  return {
    loadAll: async () => all(),
    save: async (b) => write(k, JSON.stringify([...all().filter((x) => x.pageIndex !== b.pageIndex), b])),
    remove: async (p) => write(k, JSON.stringify(all().filter((x) => x.pageIndex !== p))),
  };
}

// Light or dark: follows the device until you choose, then remembers your choice here.
const THEME_KEY = "flipbook:theme";
const themeListeners = new Set<() => void>();
const subscribeTheme = (cb: () => void) => {
  themeListeners.add(cb);
  return () => {
    themeListeners.delete(cb);
  };
};
const isDark = () => {
  const saved = read(THEME_KEY);
  return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
};
const setDark = (dark: boolean) => {
  write(THEME_KEY, dark ? "dark" : "light");
  themeListeners.forEach((l) => l());
};

const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;
const pad = (n: number) => String(n).padStart(2, "0");

export function Reader({ book }: { book: ReaderBook }) {
  const key = `${book.subject.slug}/${book.cls}`;
  const pageKey = `flipbook:page:${key}`;
  const repo = useMemo(() => bookmarkStore(`flipbook:bookmarks:${key}`), [key]);
  const controller = useFlipBookController({ initialPage: Number(read(pageKey)) || 0, bookmarkRepository: repo });
  // The book from this device's cache, or downloaded from R2 into it first (lib/book-cache.ts).
  // Stable object: a new one would reopen the book.
  const [source, setSource] = useState<{ url: string } | null>(null);
  const [got, setGot] = useState({ loaded: 0, total: 0 });
  useEffect(() => {
    const abort = new AbortController();
    let blobUrl = "";
    cachedBook(book.url, (loaded, total) => setGot({ loaded, total }), abort.signal)
      .then((blob) => {
        if (abort.signal.aborted) return;
        blobUrl = URL.createObjectURL(blob);
        setSource({ url: blobUrl });
      })
      .catch(() => abort.signal.aborted || setSource({ url: book.url })); // no cache (plain http, full disk): stream from R2
    return () => {
      abort.abort();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [book.url]);
  const downloading = !source && got.loaded > 0;
  const mb = (n: number) => Math.round(n / 1048576);

  const load = useFlipBookValue(controller.loadState);
  const liveVisible = useFlipBookValue(controller.visiblePages);
  const liveCurrent = useFlipBookValue(controller.currentPage);
  const scale = useFlipBookValue(controller.scale);
  const liveMarks = useFlipBookValue(controller.bookmarks);
  const ready = load.status === "ready";
  const total = ready ? load.pageCount : (book.pageCount ?? 0);
  // The saved page only exists in the browser: until the book opens, render as page 1 (as the server did).
  const visible = ready ? liveVisible : [0];
  const current = ready ? liveCurrent : 0;
  const marks = ready ? liveMarks : [];

  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);
  const [contents, setContents] = useState<boolean | null>(null); // null: open on desktop, closed on phones
  const [tab, setTab] = useState<"contents" | "bookmarks">("contents");
  const [twoUp, setTwoUp] = useState(true);
  const [sound, setSound] = useState(true); // the SDK plays it only after the first tap, as browsers require
  const [chrome, setChrome] = useState(true);
  const [progress, setProgress] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [scrub, setScrub] = useState<number | null>(null);

  // The book's box: the page's exact shape (or a spread's), as large as the stage allows.
  const stage = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setArea({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(stage.current!);
    return () => ro.disconnect();
  }, []);
  const A = book.pageAspect;
  const spread = twoUp && area.h > 0 && area.w / area.h >= 1.2 && Math.min(area.w / 2, area.h * A) >= 280;
  const ratio = spread ? 2 * A : A;
  const boxW = Math.min(area.w, area.h * ratio);

  useEffect(() => {
    remember({ subject: book.subject.slug, cls: book.cls });
  }, [book.subject.slug, book.cls]);

  const chapterAt = (page: number) => book.chapters.findLastIndex((c) => c.from <= page);
  const chapter = chapterAt(visible[visible.length - 1] ?? current); // the right-hand page: a chapter opening on it is the one you jumped to
  const bookmarked = marks.some((m) => visible.includes(m.pageIndex));
  const atEnd = ready && total > 0 && visible.includes(total - 1);

  const jump = (page: number) => {
    controller.jumpTo(Math.max(0, Math.min(total - 1, page)));
    if (!isDesktop()) setContents(false);
  };
  const toggleContents = () => setContents((v) => !(v ?? isDesktop()));

  // Keys: the SDK handles none itself.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input, textarea")) return;
      const actions: Record<string, () => void> = {
        ArrowRight: controller.nextPage,
        PageDown: controller.nextPage,
        ArrowLeft: controller.previousPage,
        PageUp: controller.previousPage,
        Home: () => controller.jumpTo(0),
        End: () => controller.jumpTo((controller.pageCount ?? 1) - 1),
        "+": controller.zoomIn,
        "=": controller.zoomIn,
        "-": controller.zoomOut,
        "0": controller.resetZoom,
        b: controller.toggleBookmark,
        c: toggleContents,
      };
      const act = actions[e.key];
      if (!act) return;
      e.preventDefault();
      act();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const label = visible.map((p) => p + 1).join("–");
  const sideState =
    contents === null ? "max-lg:-translate-x-full max-lg:invisible" : contents ? "translate-x-0" : "-translate-x-full invisible lg:hidden";
  const colour = ACCENT;
  const last = visible[visible.length - 1] ?? 0;
  const readPct = total ? Math.round(((last + 1) / total) * 100) : 0;
  const shown = scrub ?? current + 1;
  const pct = total > 1 ? ((shown - 1) / (total - 1)) * 100 : 0;
  const enter = (delay: number) => ({ duration: 1, delay, ease: [0.16, 1, 0.3, 1] as const });

  // keep the current chapter in view in the list
  const activeRow = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRow.current?.scrollIntoView({ block: "nearest" }); // newer browsers return a Promise here: keep it out of the effect's return
  }, [chapter]);

  return (
    <div data-theme={dark ? "dark" : "light"} className="reader-canvas fixed inset-0 flex overflow-hidden bg-[linear-gradient(180deg,var(--color-paper),var(--color-cream-2))] text-ink transition-colors duration-500">
      {/* the workspace: arrives as plain cream (like the page before), then the dot grid and light fade in */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={enter(0.1)}
        style={{
          backgroundImage: "radial-gradient(color-mix(in oklab, var(--color-ink) 10%, transparent) 1px, transparent 1.3px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 85% 75% at 56% 48%, black 30%, transparent 100%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_58%_48%,var(--glow),transparent_58%)]" />

      {/* contents and bookmarks */}
      {contents && <button type="button" aria-label="Close contents" onClick={() => setContents(false)} className="fixed inset-0 z-30 bg-ink/20 lg:hidden" />}
      <aside
        aria-label="Contents"
        className={`reader-panel fixed inset-y-0 left-0 z-40 w-[min(300px,86vw)] border-r border-ink/[0.07] bg-paper/80 backdrop-blur-2xl transition-[translate,visibility] duration-500 ease-out-expo lg:relative lg:z-10 lg:w-[264px] lg:shrink-0 lg:bg-paper/55 lg:transition-none ${sideState}`}
      >
        <motion.div className="flex h-full flex-col" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={enter(0.2)}>
          <div className="flex items-start gap-3 px-4 pb-4 pt-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-[11px] text-[14px] font-semibold tracking-[-0.03em] text-white reader-badge" style={{ backgroundColor: colour }}>
              {book.subject.symbol}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="truncate text-[16px] font-semibold leading-tight tracking-[-0.02em]">{book.title}</p>
              <p className="mt-1 truncate text-[12.5px] text-ink-2">
                {book.subject.name} · Class {book.cls}
              </p>
            </div>
          </div>

          {/* how far along */}
          <div className="reader-card mx-4 rounded-2xl bg-paper/75 p-3.5 shadow-[0_0_0_1px_rgb(36_34_32/0.04),0_1px_2px_rgb(36_34_32/0.05)]">
            <div className="flex items-baseline justify-between text-[12.5px]">
              <span className="text-ink-2">{ready ? `Page ${last + 1} of ${total}` : "Opening…"}</span>
              <span className="font-medium tabular-nums">{ready ? `${readPct}%` : ""}</span>
            </div>
            <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-ink/[0.08]">
              <div className="reader-bar h-full rounded-full transition-[width] duration-700 ease-out-expo" style={{ width: `${readPct}%` }} />
            </div>
          </div>

          <div role="tablist" className="mx-4 mt-4 grid grid-cols-2 rounded-full bg-ink/[0.045] p-1 text-[13px]">
            {(["contents", "bookmarks"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`cursor-pointer rounded-full py-1.5 capitalize transition-[background-color,color,box-shadow] duration-300 ${
                  tab === t ? "reader-tab bg-paper text-ink shadow-[0_0_0_1px_rgb(36_34_32/0.04),0_1px_3px_rgb(36_34_32/0.1)]" : "text-ink-2 hover:text-ink"
                }`}
              >
                {t}
                {t === "bookmarks" && marks.length > 0 && <span className="ml-1.5 text-ink-3">{marks.length}</span>}
              </button>
            ))}
          </div>

          <nav className="mt-3 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-4 [mask-image:linear-gradient(transparent,black_12px,black_calc(100%-20px),transparent)]">
            {tab === "contents" ? (
              book.chapters.length ? (
                <ol className="py-2">
                  {book.chapters.map((c, i) => {
                    const active = i === chapter;
                    return (
                      <li key={c.from}>
                        <button
                          ref={active ? activeRow : undefined}
                          type="button"
                          onClick={() => jump(c.from)}
                          aria-current={active ? "true" : undefined}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-[background-color,color,box-shadow] duration-300 ${
                            active ? "reader-active bg-paper text-ink shadow-[0_0_0_1px_rgb(36_34_32/0.04),0_1px_2px_rgb(36_34_32/0.06),0_8px_20px_-12px_rgb(36_34_32/0.25)]" : i < chapter ? "text-ink-3 hover:bg-ink/[0.035] hover:text-ink" : "text-ink-2 hover:bg-ink/[0.035] hover:text-ink"
                          }`}
                        >
                          <span className="w-5 shrink-0 font-mono text-[10.5px]" style={active ? { color: colour } : undefined}>
                            {pad(i + 1)}
                          </span>
                          <span className={`flex-1 truncate text-[14px] ${active ? "font-medium" : ""}`}>{c.title}</span>
                          <span className="font-mono text-[10.5px] tabular-nums text-ink-3">{c.from + 1}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="px-3 py-4 text-[14px] text-ink-2">This book has no contents list. Use the page number below to jump.</p>
              )
            ) : marks.length ? (
              <ol className="py-2">
                {marks.map((m) => (
                  <li key={m.pageIndex}>
                    <button
                      type="button"
                      onClick={() => jump(m.pageIndex)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-ink-2 transition-colors hover:bg-ink/[0.035] hover:text-ink"
                    >
                      <span style={{ color: colour }}>
                        <Icon name="bookmark" filled className="size-4 shrink-0" />
                      </span>
                      <span className="flex-1 text-[14px]">Page {m.pageIndex + 1}</span>
                      <span className="truncate text-[12px] text-ink-3">{book.chapters[chapterAt(m.pageIndex)]?.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="px-3 py-6 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-full bg-ink/[0.05] text-ink-3">
                  <Icon name="bookmark" />
                </span>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">No bookmarks yet. Use the bookmark button at the top to keep a page.</p>
              </div>
            )}
          </nav>

        </motion.div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={enter(0.15)}
          className="reader-panel relative z-10 mx-2 mt-2 flex h-[58px] shrink-0 items-center gap-0.5 rounded-full border border-ink/[0.07] bg-paper/60 px-1.5 shadow-[0_1px_0_var(--hl)_inset,0_20px_40px_-30px_rgb(36_34_32/0.35)] backdrop-blur-xl md:mx-3 md:mt-3"
        >
          <IconButton icon="panel" label="Toggle sidebar" onClick={toggleContents} />
          <Link
            href={`/${book.subject.slug}`}
            className="reader-btn flex shrink-0 items-center gap-1.5 rounded-full py-2 pl-2 pr-3 text-[14px] text-ink-2 transition-[background-color,color,box-shadow] hover:bg-paper hover:text-ink hover:shadow-[0_0_0_1px_rgb(36_34_32/0.05),0_1px_2px_rgb(36_34_32/0.08)]"
          >
            <Icon name="back" className="size-4" />
            <span className="hidden sm:inline">{book.subject.name}</span>
          </Link>
          <div className="min-w-0 flex-1 px-2 text-center">
            <h1 className="truncate text-[14.5px] font-semibold tracking-[-0.01em]">{book.title}</h1>
            <p className="hidden truncate text-[12px] text-ink-3 sm:block">
              {ready && book.chapters[chapter] ? `${book.chapters[chapter].title} · Page ${label}` : `${book.subject.name} · Class ${book.cls} · ${book.publisher}`}
            </p>
          </div>
          <IconButton icon="bookmark" label={bookmarked ? "Remove bookmark" : "Bookmark this page"} filled={bookmarked} pressed={bookmarked} disabled={!ready} onClick={controller.toggleBookmark} colour={bookmarked ? colour : undefined} />
          <IconButton icon={twoUp ? "spread" : "single"} label={twoUp ? "Show one page" : "Show two pages"} onClick={() => setTwoUp((v) => !v)} className="hidden md:grid" />
          <IconButton icon={sound ? "sound" : "mute"} label={sound ? "Turn page sound off" : "Turn page sound on"} pressed={sound} onClick={() => setSound((v) => !v)} className="hidden sm:grid" />
          <IconButton icon={dark ? "sun" : "moon"} label={dark ? "Light theme" : "Dark theme"} onClick={() => setDark(!dark)} />
        </motion.header>

        {/* the book */}
        <main className="relative flex-1">
          <div ref={stage} className="absolute inset-x-3 bottom-[8.5rem] top-5 md:inset-x-12 md:top-8">
            {boxW > 0 && source && (
              <motion.div
                className="absolute left-1/2 top-1/2"
                style={{ width: boxW, height: boxW / ratio, x: "-50%", y: "-50%" }}
                initial={{ opacity: 0, scale: 0.975 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={enter(0.3)}
              >
                {/* where the book rests on the canvas */}
                <div aria-hidden className="absolute -bottom-10 left-[2%] right-[2%] h-20 rounded-[50%] bg-[radial-gradient(closest-side,rgb(36_34_32/0.14),transparent)] blur-md" />
                <div aria-hidden className="absolute -bottom-3 left-[10%] right-[10%] h-6 rounded-[50%] bg-[radial-gradient(closest-side,rgb(36_34_32/0.22),transparent)]" />
                <SGFlipBook
                  source={source}
                  controller={controller}
                  mode={spread ? "dual" : "single"}
                  theme={dark ? DARK : LIGHT}
                  pageTurnSound={sound}
                  onTap={() => setChrome((v) => !v)}
                  onPageChanged={(p) => write(pageKey, String(p))}
                  onDownloadProgress={setProgress}
                />
              </motion.div>
            )}
          </div>

          {load.status === "loading" && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-4">
                <span className="grid size-14 animate-pulse place-items-center rounded-[16px] text-[19px] font-semibold text-white reader-badge" style={{ backgroundColor: colour }}>
                  {book.subject.symbol}
                </span>
                <p className="text-[14px] text-ink-2">{downloading ? "Downloading the book…" : "Opening the book…"}</p>
                <div className="h-[3px] w-56 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="reader-bar h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${Math.max(6, (downloading ? (got.total ? got.loaded / got.total : 0) : progress) * 100)}%` }}
                  />
                </div>
                {downloading && (
                  <p className="text-[12.5px] tabular-nums text-ink-3">
                    {mb(got.loaded)}
                    {got.total ? ` of ${mb(got.total)}` : ""} MB · saved on this device for next time
                  </p>
                )}
              </div>
            </div>
          )}
          {load.status === "failed" && (
            <div className="absolute inset-0 grid place-items-center px-6 text-center">
              <div>
                <p className="text-[19px] font-semibold tracking-[-0.02em]">The book didn’t open.</p>
                <p className="mt-2 text-[14px] text-ink-2">
                  {load.error.kind === "network" ? "Check the connection and try again." : "Something went wrong while opening it."}
                </p>
                <button type="button" onClick={controller.retry} className="mt-6 cursor-pointer rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-cream hover:bg-black">
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.25)}
            className={`absolute inset-x-0 bottom-0 flex flex-col items-center gap-3.5 px-3 pb-4 transition-opacity duration-500 md:pb-5 ${chrome && ready ? "" : "pointer-events-none opacity-0"}`}
          >
            {atEnd && (
              <div className="reader-chip flex items-center gap-3 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-[14px] text-cream shadow-[0_18px_40px_-20px_rgb(36_34_32/0.6)]">
                <span className="font-medium">The end. Well read!</span>
                <Link href={book.next?.href ?? `/${book.subject.slug}`} className="rounded-full bg-cream px-4 py-2 text-[13px] font-medium text-ink hover:bg-paper">
                  {book.next?.label ?? `More ${book.subject.name} books`} →
                </Link>
              </div>
            )}

            <div className="relative w-full max-w-xl">
              {scrub !== null && (
                <span
                  className="reader-chip pointer-events-none absolute -top-9 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[12px] font-medium text-cream"
                  style={{ left: `${pct}%` }}
                >
                  Page {scrub}
                  {book.chapters[chapterAt(scrub - 1)] ? ` · ${book.chapters[chapterAt(scrub - 1)].title}` : ""}
                </span>
              )}
              <input
                type="range"
                aria-label="Go to page"
                min={1}
                max={Math.max(1, total)}
                value={shown}
                onChange={(e) => setScrub(Number(e.target.value))}
                onPointerUp={() => {
                  if (scrub !== null) controller.jumpTo(scrub - 1);
                  setScrub(null);
                }}
                onKeyUp={() => {
                  if (scrub !== null) controller.jumpTo(scrub - 1);
                  setScrub(null);
                }}
                className="block h-5 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-[var(--c)] [&::-moz-range-thumb]:bg-paper [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:[background:var(--track)] [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:[background:var(--track)] [&::-webkit-slider-thumb]:-mt-[6.5px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[var(--c)] [&::-webkit-slider-thumb]:bg-paper [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgb(36_34_32/0.3)]"
                style={{ "--c": colour, "--track": `linear-gradient(90deg, ${colour} ${pct}%, color-mix(in oklab, var(--color-ink) 14%, transparent) ${pct}%)` } as React.CSSProperties}
              />
            </div>

            <div className="reader-panel flex items-center gap-0.5 rounded-full border border-ink/[0.07] bg-paper/60 p-1.5 shadow-[0_1px_0_var(--hl)_inset,0_24px_48px_-28px_rgb(36_34_32/0.4)] backdrop-blur-xl">
              <IconButton icon="prev" label="Previous page" onClick={controller.previousPage} disabled={current <= 0} />

              {jumping ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = Number(new FormData(e.currentTarget).get("page"));
                    if (n) controller.jumpTo(Math.max(1, Math.min(total, n)) - 1);
                    setJumping(false);
                  }}
                  className="flex items-center gap-1.5 px-2 text-[14px]"
                >
                  <input
                    name="page"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={total}
                    defaultValue={current + 1}
                    autoFocus
                    onFocus={(e) => e.currentTarget.select()}
                    onBlur={() => setJumping(false)}
                    onKeyDown={(e) => e.key === "Escape" && setJumping(false)}
                    aria-label={`Page number, 1 to ${total}`}
                    className="w-14 rounded-lg bg-paper px-2 py-1.5 text-center text-[14px] tabular-nums outline-none ring-1 ring-ink/15 [appearance:textfield] focus:ring-2 focus:ring-violet/40 [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[13px] tabular-nums text-ink-3">/ {total}</span>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setJumping(true)}
                  title="Go to page"
                  className="reader-btn min-w-[6.5rem] cursor-pointer rounded-full px-3 py-2 text-center text-[14px] font-medium tabular-nums transition-[background-color,box-shadow] hover:bg-paper hover:shadow-[0_0_0_1px_rgb(36_34_32/0.05),0_1px_2px_rgb(36_34_32/0.08)]"
                >
                  {label} <span className="font-normal text-ink-3">/ {total}</span>
                </button>
              )}
              <IconButton icon="next" label="Next page" onClick={controller.nextPage} disabled={atEnd} />
              <span className="mx-1 h-6 w-px bg-ink/[0.08]" />
              <div className="flex items-center">
                <IconButton icon="minus" label="Zoom out" onClick={controller.zoomOut} disabled={scale <= 1.01} />
                <button
                  type="button"
                  onClick={controller.resetZoom}
                  title="Fit page"
                  className="reader-btn hidden w-12 cursor-pointer rounded-full py-2 text-center text-[12.5px] tabular-nums text-ink-2 transition-[background-color,box-shadow] hover:bg-paper hover:shadow-[0_0_0_1px_rgb(36_34_32/0.05),0_1px_2px_rgb(36_34_32/0.08)] sm:block"
                >
                  {Math.round(scale * 100)}%
                </button>
                <IconButton icon="plus" label="Zoom in" onClick={controller.zoomIn} disabled={scale >= 3.99} />
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function IconButton({
  icon,
  label,
  onClick,
  pressed,
  filled,
  disabled,
  colour,
  className = "",
}: {
  icon: IconName;
  label: string;
  onClick: () => unknown;
  pressed?: boolean;
  filled?: boolean;
  disabled?: boolean;
  colour?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      style={colour ? { color: colour } : undefined}
      className={`reader-btn grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-ink-2 transition-[background-color,color,box-shadow] duration-200 hover:bg-paper hover:text-ink hover:shadow-[0_0_0_1px_rgb(36_34_32/0.05),0_1px_2px_rgb(36_34_32/0.08)] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none ${
        pressed ? "bg-paper text-ink shadow-[0_0_0_1px_rgb(36_34_32/0.05),0_1px_2px_rgb(36_34_32/0.08)]" : ""
      } ${className}`}
    >
      <Icon name={icon} filled={filled} />
    </button>
  );
}
