# Studio Galaxy theme — build brief

**Read this whole file before writing code.** This folder holds everything needed to build a
Studio Galaxy web app on a subdomain (for example a flipbook demo for a publisher or a learning
platform) that looks and feels exactly like the main site, **https://studiogalaxy.org**.
The closest reference is **https://studiogalaxy.org/projects/flipbook**. Open it and match it.

The main site is never edited from here. This app copies from it; it never changes it.

---

## What's in this folder

| Path | What it is | Use it |
|---|---|---|
| `theme.css` | Tailwind v4 tokens (colours, fonts, easing), base styles, `display` / `label` / `link-line` utilities, entrance animations, reduced-motion rules | Copy to `app/theme.css` **unchanged** |
| `components/flipbook/FlipbookReader.tsx` | The full reader around the SDK: room light, chapter narrator, chapter rail, arrows, keys, full screen, sound, PDF download, end card. Takes any PDF through a `Book` config | Copy to `components/flipbook/` unchanged |
| `components/ui/Logo.tsx` | `LogoMark` SVG component | Copy to `components/ui/` |
| `components/ui/Pill.tsx` + `Magnetic.tsx` | The primary button (dark / light), with magnetic hover | Copy both |
| `components/ui/Reveal.tsx` | `Rise`: one-time rise-in on scroll | Copy |
| `components/ui/useParallax.ts` | Pointer parallax hook | Copy if needed |
| `lib/scroll.ts` | `js()`, `plateaus()`, `peak()` helpers for scroll-linked Motion | Copy if you build scroll stories |
| `brand/` | Logo: `studio-galaxy-logo.svg` and transparent PNGs at 32–1024 px | Copy to `public/brand/`; use the 32/64 PNGs or SVG for the favicon |
| `reference/` | The main site's own `Nav.tsx`, `Footer.tsx`, `layout.tsx`, `next.config.ts` and flipbook page | **Reference only.** Don't copy as-is (they import the main site's `lib/content`). Rebuild from them with this app's links and copy |

---

## Setting up a new app

1. Create the app: Next.js 16 (App Router, TypeScript, Tailwind CSS v4, ESLint), React 19.
   Next 16 differs from older versions: check `node_modules/next/dist/docs/` before using an API.
2. Install:
   ```bash
   npm i motion@^13 "@studio-galaxy/sg-flipbook@github:Studio-Galaxy/Flipbook-Web-SDK#v1.0.1"
   ```
3. Copy the files as listed in the table above.
4. `app/globals.css` contains only this, plus app-specific additions below it:
   ```css
   @import "tailwindcss";
   @import "./theme.css";
   ```
5. `app/layout.tsx`: load **Geist** and **Geist Mono** from `next/font/google` with the variables
   `--font-geist-sans` and `--font-geist-mono`, and put both on `<html>`. `theme.css` reads those exact names.
   See `reference/layout.tsx`.
6. `next.config.ts` **must** alias pdf.js to its legacy build, or the book fails to open on older
   phones and Safari ("The book didn't open"):
   ```ts
   const nextConfig: NextConfig = {
     turbopack: { resolveAlias: { "pdfjs-dist": "pdfjs-dist/legacy/build/pdf.mjs" } },
   };
   ```
   `FlipbookReader` already points the SDK at the matching legacy worker via `configurePdf`.
7. Put the PDF in `public/` (e.g. `public/books/the-book.pdf`).

---

## The brand

### Personality
Calm, confident, crafted. Lots of cream space, big tight headlines, small mono labels, one violet
accent. Things move slowly and land softly. Never loud, never busy, no gradients-for-the-sake-of-it,
no stock illustrations, no emoji in UI.

### Colour: use the tokens, never raw hex

| Token (Tailwind) | Value | Use |
|---|---|---|
| `cream` | `#f7f0e7` | Page background (the default for everything) |
| `cream-2` | `#efe6da` | Light buttons, chips, quiet fills |
| `paper` | `#fbf7f1` | Cards that sit on cream |
| `ink` | `#242220` | Text, dark buttons, logo tile |
| `ink-2` | `#6f6961` | Secondary text, paragraphs under headlines |
| `ink-3` | `#a39b91` | Tertiary text; the grey second line of a headline |
| `line` | `rgb(36 34 32 / 0.12)` | Hairlines, borders, grid gaps |
| `lavender` | `#d8c9ff` | Text selection, soft highlights |
| `lilac` | `#ebe3ff` | Hover on light buttons |
| `violet` | `#7447ff` | **The only accent.** Headline full stops, index numbers, eyebrow labels, focus rings. Sparingly |
| `deep` | `#1b1428` | Dark violet-black for shadows and dark scenes |
| `space` | `#0c0b10` | Darkest surface |

The logo's dot is `#9b7bff`. It's used only inside the logo.

### Type: Geist, tight and big
- **Display headlines:** the `display` utility (600 weight, −0.05em tracking, 0.92 line height, balanced).
  - Page h1: `display text-[clamp(3.1rem,10vw,10.5rem)]`, ending in a violet full stop: `Turn the page<span className="text-violet">.</span>`
  - Section h2: `display text-[clamp(2.6rem,6.4vw,6.6rem)]`, often two lines with the second in `text-ink-3`.
- **Eyebrow / meta:** the `label` utility (Geist Mono 11px, uppercase, 0.14em), in `text-ink-2` or `text-violet`.
- **Intro paragraph:** `text-[clamp(1.15rem,1.6vw,1.45rem)] leading-snug tracking-[-0.02em] text-ink-2 max-w-xl`.
- **Card title:** `text-[22px] font-semibold tracking-[-0.03em]`. **Body:** `text-[15px] leading-relaxed text-ink-2`.
- **Index numbers:** `font-mono text-[11px] text-violet` → `01`, `02`…
- **Text links:** `link-line` (the underline draws in on hover), plus an arrow `→`, `↓` or `↗` that nudges on hover.

### Layout
- **Page gutter:** `px-5 md:px-10 lg:px-16`. **Hero:** `pt-36 md:pt-48`. **Sections:** `py-24 md:py-40`.
- **Section header:** a 12-column grid. The `label` sits in `md:col-span-3` and the headline in `md:col-span-9`. Gap between header and content: `mt-16 md:mt-24`.
- **Radii:** cards `rounded-[28px]`, large stages `rounded-[40px]`, buttons and nav `rounded-full`.
- **Card grids:** hairline grid with `gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line`, each cell `bg-cream p-7 md:p-9`.
- **Lists:** editorial rows with `border-b border-line` and the index, title, line and action in columns.
- **Nav:** a floating pill fixed at the top, centred. The logo and "Studio Galaxy" sit on the left, links on the right, and a full-screen menu shows on mobile. See `reference/Nav.tsx`.
- **Footer:** a hairline top border, the logo, a short line and the links. See `reference/Footer.tsx`.
- Mobile-first. No horizontal scroll (`overflow-x: clip` is in `theme.css`). The scrollbar is hidden on purpose.

### Motion (Motion library, `motion/react`)
- One easing everywhere: `cubic-bezier(0.16, 1, 0.3, 1)` (`ease-out-expo` in Tailwind, `[0.16, 1, 0.3, 1]` in Motion).
- Durations: 0.3s for colours, 0.5–0.7s for movement, 1.1s for entrances.
- Sections rise in once with `<Rise>`. Buttons are `<Pill>` (magnetic). Nothing loops for attention.
- `prefers-reduced-motion` is respected globally by `theme.css`. Keep it that way.
- For scroll-linked values, map through `js()` from `lib/scroll.ts`. Don't pass raw ranges, which Motion may hand to a native ScrollTimeline that mis-maps offsets.

### Logo
- Use `<LogoMark className="size-7" />` next to "Studio Galaxy" set in `font-semibold tracking-[-0.03em]`.
- Never recolour, stretch, outline or add effects. Minimum size: 24px. Keep at least half its width clear around it.
- Files are in `brand/`.

### Voice and copy
- Short sentences. Plain words. Headlines end with a full stop (violet).
- British spelling, as on the main site ("catalogue", "colour").
- **No fake claims.** No invented clients, numbers, awards, testimonials or partnerships. A real
  publisher's name or logo appears only with their written permission.

---

## The flipbook

```tsx
import { FlipbookReader, type Book } from "@/components/flipbook/FlipbookReader";

const book: Book = {
  title: "The Book Title",                  // screen readers: "<title> — an interactive flipbook"
  url: "/books/the-book.pdf",
  pageAspect: 156 / 234,                    // page width ÷ height (A4 = 210 / 297). Measure the PDF.
  pageCount: 24,                            // lets the chapter rail draw before the PDF loads
  darkPages: [0],                           // zero-based pages with dark backgrounds: the room dims behind them
  chapters: [                               // zero-based start page + one narrator line each
    { title: "Cover", from: 0, line: "A first look." },
    { title: "Chapter one", from: 3, line: "Where it begins." },
  ],
  end: {
    title: "Want a flipbook like this?",
    text: "Catalogues, menus, magazines, reports — turned into books people enjoy opening.",
    cta: { label: "Talk to Studio Galaxy", href: "https://studiogalaxy.org/#contact" },
  },
};

<FlipbookReader book={book} />
```

- Always link the end card and the footer back to **https://studiogalaxy.org** (`/#contact` for enquiries).
- The SDK colours (page back, placeholder, shadows) and the room colours are set at the top of
  `FlipbookReader.tsx`. They match the theme, so leave them.
- Spreads show on wide screens and single pages on narrow ones. The reader's window is sized to `pageAspect`, so measure it correctly or the page curl shows an empty edge.
- Known SDK limitation: in spread mode the curl shadow can draw over an empty slot next to the cover and back cover. Fix it in the SDK, not here.
- **Rights:** hosting a real publisher's book needs their written permission. Label the page as a demo.

---

## Hosting on a subdomain
1. Push this app to its own repo and import it as a **new** Vercel project.
2. Vercel → Project → Settings → Domains → add e.g. `publishers.studiogalaxy.org`.
3. Add the DNS record Vercel shows (a CNAME for the subdomain) wherever studiogalaxy.org's DNS is managed.
4. Set `metadataBase` and the canonical URL to the subdomain, and give it its own `robots` and `sitemap`.

## Don'ts
- Don't change `theme.css` values or add new colours. Compose from the tokens.
- Don't add a second accent colour, gradient backgrounds, drop-shadow-heavy cards or new fonts.
- Don't add component libraries (no shadcn, MUI, etc.). Tailwind, Motion and these files are enough.
- Don't edit `FlipbookReader.tsx` for one book's needs. Pass it a different `Book`.
