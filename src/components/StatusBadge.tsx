import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "red" | "gray" | "navy";

const tones: Record<Tone, string> = {
  blue:  "bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]",
  red:   "bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))]",
  gray:  "bg-muted text-muted-foreground",
  navy:  "bg-[hsl(var(--navy))]/10 text-[hsl(var(--navy))]",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  blue: CheckCircle2,
  red:  AlertCircle,
};

interface Props {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  icon?: boolean;
}

export function StatusBadge({ tone = "blue", children, className, dot, icon }: Props) {
  const IconComp = icon ? statusIcons[tone] : undefined;
  return (
    <span className={cn("badge-soft", tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" aria-hidden="true" />}
      {IconComp && <IconComp className="h-3 w-3 shrink-0" aria-hidden="true" />}
      {!dot && !IconComp && <Circle className="h-1.5 w-1.5 fill-current shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function statusToTone(status: string): Tone {
  switch (status) {
    case "High":
    case "Risiko":
    case "Eskalasi":
    case "At Risk":
    case "Kritis":
      return "red";
    case "Medium":
    case "Follow Up":
    case "Perlu Pantau":
    case "Perlu Dorongan":
    case "Watchlist":
    case "Perhatian":
    case "Low":
    case "Healthy":
    case "Sehat":
    case "In Progress":
    case "Baik":
    case "Close":
    case "Aman":
    case "Sukses":
    case "Sangat Baik":
    case "Closed":
      return "blue";
    case "Not Eligible":
    case "Inactive":
      return "gray";
    case "Contact":
    case "Meet":
    case "Prospect":
      return "navy";
    default:
      return "gray";
  }
}
