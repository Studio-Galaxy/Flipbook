# Flipbook

A demo learning library by Studio Galaxy, made with our Flipbook SDK.
Twelve subjects, Class 1 to 8 each. Lives at **flipbook.studiogalaxy.org**.

```bash
npm install
npm run dev      # http://localhost:3001
npm run build
```

## Adding a publisher's book
Only with the publisher's written permission. See the top of `lib/library.ts`:
put the PDF in `public/books/<subject>/` and add one entry to that subject.
Classes without a book show as "Arriving soon".

## Moving it to its own repo
This folder is a complete app: copy it out, `git init`, push.
Then in Vercel: import the repo as a new project → Settings → Domains → add
`flipbook.studiogalaxy.org`, and add the DNS record Vercel shows where studiogalaxy.org's DNS lives.
While it sits inside the studio repo, the main site's `tsconfig.json`, `eslint.config.mjs` and
`app/globals.css` exclude this folder. Remove those three lines once it has moved.

## Theme
Same tokens as studiogalaxy.org (`app/theme.css`; guide in `THEME.md`). Don't edit `theme.css` here.
