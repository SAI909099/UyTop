import type { ReactNode } from "react";

import { PremiumCard } from "@/components/ui/premium-card";

type BrandHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  caption: string;
  badges?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

export function BrandHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  caption,
  badges,
  actions,
  aside,
  className = "",
}: BrandHeroProps) {
  return (
    <PremiumCard className={`brand-hero ${className}`.trim()}>
      <div className="brand-hero-grid">
        <div className="brand-hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          {badges ? <div className="inline-badges">{badges}</div> : null}
          <h1>{title}</h1>
          <p className="hero-lead">{description}</p>
          {actions ? <div className="hero-actions">{actions}</div> : null}
        </div>

        <div className="brand-hero-media">
          <img src={image} alt={imageAlt} />
          <div className="brand-hero-caption">{caption}</div>
          {aside ? <div className="brand-hero-aside">{aside}</div> : null}
        </div>
      </div>
    </PremiumCard>
  );
}
