// The whole library. Every subject shows Class 1–8; a class without a PDF shows as "Arriving soon".
//
// Adding a publisher's book (only with their permission):
//   1. Upload the PDF to the private R2 bucket as books/<subject>/class-<NN>/<subject>-<NN>.pdf,
//      e.g. books/maths/class-03/maths-03.pdf (app/api/book/[subject]/[cls]/route.ts signs links to it).
//      No R2 paths in this file: it is also sent to the browser.
//   2. Pass it to that subject below, keyed by class:
//        subject("maths", "Maths", "Ma", "Numbers, shapes and patterns.", "#7447ff", {
//          3: { title: "Times Tables", publisher: "Publisher Name",
//               pageAspect: 210 / 297, pageCount: 32 },
//        }),
//      Optional: chapters for the reader's contents, as { title, from } with zero-based start pages.
//      Most PDFs carry an outline with these; pdf.js's getOutline() lists them.

export type LibraryBook = {
  title: string;
  publisher: string;
  /** Page width ÷ height (A4 portrait = 210 / 297). */
  pageAspect: number;
  pageCount?: number;
  chapters?: { title: string; from: number }[];
};

export type Subject = {
  slug: string;
  name: string;
  /** Two letters, like an element in a periodic table. */
  symbol: string;
  line: string;
  /** Cover colour. Darker and lighter shades are mixed from it. */
  colour: string;
  books: Partial<Record<number, LibraryBook>>;
};

export const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8];

export const deep = (s: Subject, pct = 30) => `color-mix(in oklab, ${s.colour}, black ${pct}%)`;
export const tint = (s: Subject) => `color-mix(in oklab, ${s.colour} 14%, white)`;

const subject = (
  slug: string, name: string, symbol: string, line: string, colour: string,
  books: Subject["books"] = {},
): Subject => ({ slug, name, symbol, line, colour, books });

export const subjects: Subject[] = [
  subject("maths", "Maths", "Ma", "Numbers, shapes and patterns.", "#7447ff"),
  subject("english", "English", "En", "Letters, words and stories.", "#e5533d"),
  subject("science", "Science", "Sc", "How everything around us works.", "#12906a"),
  subject("world", "Our World", "Wo", "Places, people and the past.", "#2a78d6"),
  subject("hindi", "Hindi", "Hi", "Letters, words and stories in Hindi.", "#d97a0f", {
    2: {
      title: "भाषा चयन", // Bhasha Chayan, from the cover
      publisher: "Publisher", // TODO: credit the publisher
      pageAspect: 630 / 810,
      pageCount: 68,
      // From the book's contents page (विषय-सूची, page 2); start pages from the PDF's outline.
      chapters: [
        { title: "आवरण · Cover", from: 0 },
        { title: "विषय-सूची · Contents", from: 1 },
        { title: "भाषा · Language", from: 2 },
        { title: "वर्ण एवं वर्णमाला · Letters and Alphabet", from: 6 },
        { title: "मात्राएँ और शब्द · Signs of Vowels and Words", from: 11 },
        { title: "वाक्य · Sentences", from: 17 },
        { title: "संज्ञा · Nouns", from: 21 },
        { title: "लिंग · Gender", from: 26 },
        { title: "वचन · Number", from: 30 },
        { title: "सर्वनाम · Pronouns", from: 35 },
        { title: "विशेषण · Adjectives", from: 38 },
        { title: "क्रिया · Verbs", from: 42 },
        { title: "विलोम शब्द · Antonyms", from: 46 },
        { title: "पर्यायवाची शब्द · Synonyms", from: 49 },
        { title: "अनेक शब्दों के लिए एक शब्द · One Word Substitution", from: 52 },
        { title: "गिनती · Counting", from: 55 },
        { title: "दिन और महीने · Days and Months", from: 59 },
        { title: "कहानी-लेखन तथा चित्र-वर्णन · Story Writing", from: 62 },
        { title: "श्रवण कौशल · Listening text for teachers", from: 66 },
      ],
    },
  }),
  subject("computers", "Computers", "Co", "How machines think, and how to tell them what to do.", "#2f3a4a"),
  subject("art", "Art & Craft", "Ar", "Colour, shape and making things.", "#c23a83"),
  subject("music", "Music", "Mu", "Rhythm, melody and songs.", "#0f8a8f"),
  subject("gk", "General Knowledge", "Gk", "Curious facts about everything.", "#a8780c"),
  subject("environment", "Environment", "Ev", "Nature, and how to look after it.", "#5f8a1f"),
  subject("health", "Health & PE", "Pe", "Moving, playing and staying well.", "#d0434f"),
  subject("values", "Values", "Va", "Kindness, honesty and getting along.", "#8a5a3c"),
];

export const subjectBy = (slug: string) => subjects.find((s) => s.slug === slug);
