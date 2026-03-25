import type { HTMLAttributes, PropsWithChildren } from "react";

export function PremiumCard({
  children,
  className = "",
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement> & { className?: string }>) {
  return (
    <div {...props} className={`premium-card ${className}`.trim()}>
      {children}
    </div>
  );
}
