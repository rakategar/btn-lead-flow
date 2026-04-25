import { cn } from "@/lib/utils";

type Tone = "blue" | "orange" | "green" | "red" | "gray" | "purple" | "navy";

const tones: Record<Tone, string> = {
  blue: "bg-primary-light text-primary",
  orange: "bg-accent-light text-accent",
  green: "bg-success-light text-success",
  red: "bg-danger-light text-danger",
  gray: "bg-muted text-muted-foreground",
  purple: "bg-[hsl(var(--purple-soft))] text-[hsl(var(--purple-soft-foreground))]",
  navy: "bg-navy/10 text-navy",
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
    case "Baru": return "blue";
    case "Terhubungi": return "purple";
    case "Follow-up": return "orange";
    case "Konsultasi": return "purple";
    case "Pengajuan": return "green";
    case "Lost": return "gray";
    case "Eskalasi": return "red";
    case "Aman":
    case "Sehat":
    case "Selesai":
    case "Sukses":
    case "Aktif": return "green";
    case "Risiko":
    case "Lewat":
    case "High": return "red";
    case "Perlu Pantau":
    case "Menunggu":
    case "Medium": return "orange";
    case "Low": return "blue";
    default: return "gray";
  }
}
