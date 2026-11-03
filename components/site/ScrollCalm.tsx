"use client";

import { useEffect } from "react";

// While the page scrolls, cards under a resting cursor would lift and drop one after another — it reads as jitter.
// So hover is paused during a scroll (see globals.css) and returns a moment after it stops.
export function ScrollCalm() {
  useEffect(() => {
    const root = document.documentElement;
    let t = 0;
    const onScroll = () => {
      if (!("scrolling" in root.dataset)) root.dataset.scrolling = "";
      clearTimeout(t);
      t = window.setTimeout(() => delete root.dataset.scrolling, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);
  return null;
}
