import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary: "button button-primary",
  secondary: "button button-secondary",
  ghost: "button button-ghost",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; className?: string }>) {
  return (
    <button {...props} className={`${styles[variant]} ${className}`.trim()}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className = "",
  href,
  variant = "primary",
  ...props
}: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; className?: string }>) {
  return (
    <Link href={href} className={`${styles[variant]} ${className}`.trim()} {...props}>
      {children}
    </Link>
  );
}
