type StatCardProps = {
  label: string;
  value: string;
  tone?: "default" | "accent";
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className={`stat-card ${tone === "accent" ? "stat-card-accent" : ""}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
