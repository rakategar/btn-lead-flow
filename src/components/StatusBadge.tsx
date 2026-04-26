import { cn } from "@/lib/utils";

type Tone = "blue" | "orange" | "green" | "red" | "gray" | "purple" | "navy" | "gold";

const tones: Record<Tone, string> = {
  blue: "bg-primary-light text-primary",
  orange: "bg-accent-light text-accent",
  green: "bg-success-light text-success",
  red: "bg-danger-light text-danger",
  gray: "bg-muted text-muted-foreground",
  purple: "bg-[hsl(var(--purple-soft))] text-[hsl(var(--purple-soft-foreground))]",
  navy: "bg-navy/10 text-navy",
  gold: "bg-gold-light text-[hsl(var(--gold))]",
};

interface Props {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ tone = "blue", children, className, dot }: Props) {
  return (
    <span className={cn("badge-soft", tones[tone], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", `bg-current opacity-70`)} />}
      {children}
    </span>
  );
}

export function statusToTone(status: string): Tone {
  switch (status) {
    case "Hot":
    case "High":
    case "Risiko":
    case "Eskalasi":
      return "red";
    case "Warm":
    case "Medium":
    case "Follow Up":
    case "Perlu Pantau":
    case "Perlu Dorongan":
      return "orange";
    case "Cold":
    case "Low":
      return "blue";
    case "Close":
    case "Aman":
    case "Sukses":
    case "Sangat Baik":
    case "Sehat":
      return "green";
    case "In Progress":
    case "Baik":
      return "blue";
    case "Not Eligible":
      return "gray";
    default:
      return "gray";
  }
}
