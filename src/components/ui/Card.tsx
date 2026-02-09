import type { HTMLAttributes, ReactNode } from "react";

// [Template] — Card container with header, content, and footer slots.

type Padding = "compact" | "default";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  children: ReactNode;
}

const paddingClasses: Record<Padding, string> = {
  compact: "p-4",
  default: "p-6",
};

function Card({
  padding = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-surface rounded-[var(--ds-radius-lg)] border border-border ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps };
