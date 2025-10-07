"use client";

import { PropsWithChildren } from "react";

type GlowButtonProps = PropsWithChildren<{
  className?: string;
  radiusRem?: number;
  as?: keyof JSX.IntrinsicElements;
}>;

export function GlowButton({
  children,
  className = "",
  radiusRem = 1.5,
  as = "button",
}: GlowButtonProps) {
  const Comp: any = as;
  return (
    <div
      className="glow-btn"
      style={{ ["--glow-radius" as any]: `${radiusRem}rem` }}
    >
      <div className="glow-btn-track">
        <div className="glow-btn-dot" />
      </div>
      <Comp className={`glow-btn-inner ${className}`}>{children}</Comp>
    </div>
  );
}

