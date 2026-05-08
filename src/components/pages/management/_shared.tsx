import { cn } from "@/lib/utils";
import type { BranchStatus } from "@/lib/dummy-data";
import type { Tone } from "@/components/StatusBadge";

export function PageHero({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <div className="panel p-5 sm:p-6 bg-gradient-to-r from-primary-light/60 via-card to-card border-l-4 border-l-primary">
      <div className="text-xs uppercase tracking-wider font-semibold text-primary">{badge ?? "Management · Superuser"}</div>
      <h2 className="mt-1 text-xl sm:text-2xl font-bold text-navy">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function SectionHead({ title, caption, action }: { title: string; caption?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h3 className="text-base font-bold text-navy">{title}</h3>
        {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      </div>
      {action}
    </div>
  );
}

export function PanelHeader({ title, caption, icon: Icon }: { title: string; caption?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-bold text-navy">{title}</h3>
        {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      </div>
    </div>
  );
}

export function ProgressBar({ pct, tone }: { pct: number; tone?: "primary" | "success" | "danger" | "gold" | "accent" }) {
  const fill =
    tone === "success" ? "bg-success" :
    tone === "danger" ? "bg-danger" :
    tone === "gold" ? "bg-[hsl(var(--gold))]" :
    tone === "accent" ? "bg-accent" :
    "bg-primary";
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", fill)} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function statusToneFor(s: BranchStatus): Tone {
  return s === "Healthy" ? "green" : s === "Watchlist" ? "orange" : "red";
}

export function fmtRp(juta: number) {
  if (juta >= 1000) return `Rp ${(juta / 1000).toFixed(1)} M`;
  return `Rp ${juta.toLocaleString("id-ID")} jt`;
}

export function todayLabel() {
  return new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
