import type { ComponentProps } from "react";
import { Magnetic } from "./Magnetic";

const tones = {
  dark: "bg-ink text-cream shadow-[0_18px_40px_-18px_rgb(36_34_32/0.6)] hover:bg-black",
  light: "bg-cream-2 text-ink hover:bg-lilac",
};

type Props = { tone?: keyof typeof tones; arrow?: string } & (
  | ({ href: string } & ComponentProps<"a">)
  | ({ href?: undefined } & ComponentProps<"button">)
);

export function Pill({ tone = "dark", arrow = "→", children, className = "", ...rest }: Props) {
  const cls = `group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-medium tracking-[-0.01em] transition-[background-color,transform] duration-300 active:scale-[0.97] disabled:opacity-50 ${tones[tone]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
          {arrow}
        </span>
      )}
    </>
  );
  return (
    <Magnetic strength={0.2}>
      {"href" in rest && rest.href !== undefined ? (
        <a {...(rest as ComponentProps<"a">)} className={cls}>{inner}</a>
      ) : (
        <button {...(rest as ComponentProps<"button">)} className={cls}>{inner}</button>
      )}
    </Magnetic>
  );
}
