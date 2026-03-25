type VerifiedBadgeProps = {
  label?: string;
};

export function VerifiedBadge({ label = "Verified developer" }: VerifiedBadgeProps) {
  return (
    <span className="verified-badge">
      <span className="verified-badge-mark" aria-hidden="true" />
      {label}
    </span>
  );
}
