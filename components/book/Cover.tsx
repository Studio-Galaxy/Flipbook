// A cover, laid out like a tile from a periodic table: number, symbol, name.
// Used for subjects ("Ma", Maths) and for classes ("3", the class's book).
// Put it inside a `group` link: it lifts a little on hover.

type Props = {
  background: string;
  index: string;
  label: string;
  symbol: string;
  title: string;
  sub?: string;
  muted?: boolean;
};

export function Cover({ background, index, label, symbol, title, sub, muted }: Props) {
  // Only translate and opacity animate (compositor-only, no repaint): the hover shadow
  // is pre-painted on its own layer and fades in, rather than animating box-shadow.
  return (
    <div className={`relative transition-[translate] duration-500 ease-out-expo ${muted ? "" : "group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5"}`}>
      {!muted && (
        <div
          aria-hidden
          className="absolute inset-x-[5%] bottom-0 top-[12%] rounded-[22px] opacity-0 shadow-[0_30px_48px_-22px_rgb(36_34_32/0.6)] transition-opacity duration-500 ease-out-expo group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      )}
      <div
        className={`@container relative aspect-[4/5] overflow-hidden rounded-[22px] ${
          muted ? "text-ink-3 ring-1 ring-inset ring-line" : "text-cream shadow-[0_1px_2px_rgb(36_34_32/0.1)]"
        }`}
        style={{ background }}
      >
        {!muted && (
          <div
            aria-hidden
            className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(160deg,rgb(255_255_255/0.16),transparent_42%,rgb(0_0_0/0.14))] ring-1 ring-inset ring-white/10"
          />
        )}
        <div className="relative flex h-full flex-col p-[8cqw]">
          <div className="flex items-start justify-between font-mono text-[4.6cqw] uppercase tracking-[0.14em] opacity-75">
            <span>{index}</span>
            <span>{label}</span>
          </div>
          <p className="mt-auto text-[38cqw] font-semibold leading-[0.8] tracking-[-0.06em] transition-transform duration-700 ease-out-expo group-hover:-translate-y-[2cqw]">
            {symbol}
          </p>
          <p className="mt-[7cqw] text-[clamp(13px,7.4cqw,22px)] font-semibold leading-tight tracking-[-0.03em]">{title}</p>
          {sub && <p className="mt-[1.5cqw] truncate text-[clamp(11px,4.8cqw,14px)] opacity-70">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
