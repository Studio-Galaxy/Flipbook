"use client";

import { useEffect, useState } from "react";
import { forgetAll, useLast, useSavedCount } from "@/lib/progress";
import { subjectBy } from "@/lib/library";

// Reads this browser live, so the privacy promises can be checked rather than trusted.

type Reading = { cookies: number; thirdParty: number };

function read(): Reading {
  const cookies = document.cookie ? document.cookie.split(";").filter((c) => c.trim()).length : 0;
  const thirdParty = [...document.querySelectorAll<HTMLScriptElement>("script[src]")].filter(
    (s) => new URL(s.src, location.href).origin !== location.origin,
  ).length;
  return { cookies, thirdParty };
}

export function Readout() {
  const [r, setR] = useState<Reading | null>(null);
  const last = useLast();
  const saved = useSavedCount();
  const s = last && subjectBy(last.subject);

  useEffect(() => {
    const t = setTimeout(() => setR(read()), 600); // a beat, so the check reads as a check
    return () => clearTimeout(t);
  }, []);

  const rows = [
    { label: "Cookies", value: r && String(r.cookies) },
    { label: "Third-party scripts", value: r && String(r.thirdParty) },
    { label: "Saved on this device", value: r && (saved ? (s ? `${s.name} Class ${last!.cls}${saved > 1 ? ` + ${saved - 1} more` : ""}` : `${saved} item${saved > 1 ? "s" : ""}`) : "Nothing") },
  ];

  return (
    <div className="rounded-[28px] bg-ink p-6 text-cream md:rounded-[40px] md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="label flex items-center gap-2 text-cream/60">
          <span className={`size-1.5 rounded-full ${r ? "bg-lavender" : "animate-pulse bg-cream/60"}`} />
          {r ? "Read live from this browser" : "Checking this browser…"}
        </p>
        {saved > 0 && (
          <button
            type="button"
            onClick={forgetAll}
            className="cursor-pointer rounded-full bg-cream/10 px-4 py-2 text-[13px] transition-colors hover:bg-cream/20"
          >
            Clear everything saved
          </button>
        )}
      </div>
      <dl className="mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-6">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="label text-cream/50">{row.label}</dt>
            <dd className="mt-3 text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-tight tracking-[-0.04em]">
              {row.value ?? <span className="text-cream/30">…</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
