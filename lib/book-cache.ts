// Books live on R2. Each one downloads once, whole, then opens from this device's Cache Storage,
// so a return visit costs R2 nothing. The KEEP most recently opened books stay; older ones are dropped.
// ponytail: a book replaced on R2 under the same URL stays stale here; give a new edition a new file name.

const CACHE = "flipbook-books";
const RECENT_KEY = "flipbook:recent-books";
const KEEP = 3;

const recent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
};

/**
 * The book's bytes from the cache, or downloaded from [url] into it first.
 * [onProgress] gets bytes so far and the total (0 if the server doesn't say).
 * Rejects when Cache Storage is missing (plain http), full, or the download fails.
 */
export async function cachedBook(url: string, onProgress: (loaded: number, total: number) => void, signal: AbortSignal): Promise<Blob> {
  url = new URL(url, location.href).href; // cache keys are absolute
  const cache = await caches.open(CACHE);
  let hit = await cache.match(url);
  if (!hit) {
    const res = await fetch(url, { signal });
    if (!res.ok || !res.body) throw new Error(`R2 answered ${res.status}`);
    const total = Number(res.headers.get("content-length")) || 0;
    let loaded = 0;
    const counted = res.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, out) {
          loaded += chunk.byteLength;
          onProgress(loaded, total);
          out.enqueue(chunk);
        },
      }),
    );
    // streamed straight to disk: the 180 MB never sits in memory
    await cache.put(url, new Response(counted, { headers: { "content-type": "application/pdf" } }));
    hit = await cache.match(url);
    if (!hit) throw new Error("The book could not be saved on this device");
  }

  const keep = [url, ...recent().filter((u) => u !== url)].slice(0, KEEP);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(keep));
  } catch {}
  for (const req of await cache.keys()) if (!keep.includes(req.url)) await cache.delete(req);

  return hit.blob();
}
