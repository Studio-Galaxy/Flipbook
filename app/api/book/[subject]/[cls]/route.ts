import { AwsClient } from "aws4fetch";
import { subjectBy } from "@/lib/library";

// Sends the reader to a 5-minute signed link for a book in the private R2 bucket.
// The bucket, its paths and the keys stay here on the server (from .env);
// the browser only ever sees /api/book/<subject>/<class> and a link that soon expires.
// A book lives in the bucket at books/<subject>/class-<NN>/<subject>-<NN>.pdf,
// e.g. books/hindi/class-02/hindi-02.pdf, and is served only if lib/library.ts lists it.

export async function GET(req: Request, { params }: { params: Promise<{ subject: string; cls: string }> }) {
  // Only the reader page may ask. Opening this address directly or from another site gets nothing.
  // ponytail: a header, not auth; curl can fake it. Add logins if books must be private to students.
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response("Not here", { status: 403 });

  const { subject, cls } = await params;
  const n = Number(cls);
  if (!subjectBy(subject)?.books[n]) return new Response("No such book", { status: 404 });

  const { R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) throw new Error("R2_* missing from .env");

  const nn = String(n).padStart(2, "0");
  const url = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/books/${subject}/class-${nn}/${subject}-${nn}.pdf`);
  url.searchParams.set("X-Amz-Expires", "300");
  const r2 = new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: "s3", region: "auto" });
  const signed = await r2.sign(url, { aws: { signQuery: true } });

  return new Response(null, { status: 302, headers: { location: signed.url, "cache-control": "no-store" } });
}
