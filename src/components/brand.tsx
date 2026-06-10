import Link from "next/link";

import { cn } from "@/lib/utils";

const markSize = {
  sm: "size-6 text-xs",
  md: "size-7 text-sm",
  lg: "size-9 text-base",
} as const;

const textSize = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

type LogoProps = {
  size?: keyof typeof markSize;
  href?: string;
  showWordmark?: boolean;
  className?: string;
};

/** LinguaCoach のロゴ。マーク（角丸の "L"）＋ワードマーク。 */
export function Logo({
  size = "md",
  href = "/",
  showWordmark = true,
  className,
}: LogoProps) {
  const content = (
    <span
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-md bg-primary font-mono text-primary-foreground",
          markSize[size]
        )}
      >
        L
      </span>
      {showWordmark && <span className={textSize[size]}>LinguaCoach</span>}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
