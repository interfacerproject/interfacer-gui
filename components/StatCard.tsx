import { ReactNode } from "react";

interface StatItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  iconColor?: string;
}

interface StatCardProps {
  stats: StatItem[];
  className?: string;
}

export default function StatCard({ stats, className }: StatCardProps) {
  return (
    <div className={`flex flex-wrap bg-ifr-surface border border-ifr rounded-ifr-lg ${className || ""}`}>
      {stats.map((stat, i) => (
        <div key={i} className="flex-1 min-w-[120px] p-4">
          <div className="flex items-center gap-2">
            {stat.icon && <span style={{ color: stat.iconColor }}>{stat.icon}</span>}
            <span className="text-sm text-ifr-text-secondary">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--ifr-font-heading)" }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
