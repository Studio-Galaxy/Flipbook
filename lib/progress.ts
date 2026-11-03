import { useSyncExternalStore } from "react";

// What Flipbook stores, all in this browser's localStorage under "flipbook:": the last book opened,
// the page you're on in each book, your bookmarks and light or dark reading (the reader writes those).
// Nothing leaves the device. /grown-ups shows it and can clear it.

export const LAST = "flipbook:last";
export type Last = { subject: string; cls: number };

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function remember(last: Last) {
  try {
    localStorage.setItem(LAST, JSON.stringify(last));
  } catch {} // private mode or blocked storage: Flipbook still works, it just forgets
  notify();
}

export function forgetAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("flipbook:"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
  notify();
}

/** How many things are saved, read live. */
export function useSavedCount() {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return Object.keys(localStorage).filter((k) => k.startsWith("flipbook:")).length;
      } catch {
        return 0;
      }
    },
    () => 0,
  );
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const read = () => {
  try {
    return localStorage.getItem(LAST);
  } catch {
    return null;
  }
};

export function useLast(): Last | null {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Last;
  } catch {
    return null;
  }
}
