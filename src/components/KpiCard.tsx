import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  hint?: string;
  delta?: { value: string; up?: boolean };
  icon: React.ComponentType<{ className?: string }>;
  tone?: "blue" | "red" | "navy" | "muted";
}

const toneMap = {
  blue:  "bg-primary-light text-primary",
  red:   "bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))]",
  navy:  "bg-navy/10 text-navy",
  muted: "bg-muted text-muted-foreground",
};

export function KpiCard({ title, value, hint, delta, icon: Icon, tone = "blue" }: Props) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneMap[tone])}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        {delta && (
          <span className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            delta.up ? "text-primary" : "text-[hsl(var(--danger))]"
          )}>
            {delta.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {delta.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight text-navy">{value}</div>
        {hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}
