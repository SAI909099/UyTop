export type SummaryMetric = {
  label: string;
  value: string;
  detail?: string;
};

type AvailabilitySummaryProps = {
  items: SummaryMetric[];
  className?: string;
};

export function AvailabilitySummary({ items, className = "" }: AvailabilitySummaryProps) {
  return (
    <div className={`metric-grid ${className}`.trim()}>
      {items.map((item) => (
        <article key={item.label} className="metric-card">
          <p>{item.label}</p>
          <strong>{item.value}</strong>
          {item.detail ? <span>{item.detail}</span> : null}
        </article>
      ))}
    </div>
  );
}
