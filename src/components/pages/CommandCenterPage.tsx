import { Activity, Target, AlertTriangle, Award, GraduationCap, TrendingDown } from "lucide-react";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { initialLeads, activityEffectiveness, mtdKpi, earlyWarnings, type Lead, type PipelineStage } from "@/lib/dummy-data";

const stages: PipelineStage[] = ["Contact", "Meet", "Prospect", "Close"];

interface Props { leads: Lead[] }

export function CommandCenterPage({ leads }: Props) {
  return (
    <div className="space-y-5">
      {/* 1. Pipeline Board */}
      <section className="panel p-5">
        <Header title="Pipeline & Progress Tracking" caption="Status Contact hingga Close — visibilitas pergerakan setiap lead." icon={Activity} />
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {stages.map((s) => {
            const items = leads.filter((l) => l.stage === s).slice(0, 4);
            return (
              <div key={s} className="rounded-xl bg-muted/40 border border-border p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-navy">{s}</div>
                  <StatusBadge tone="gold">{items.length}</StatusBadge>
                </div>
                <div className="space-y-2">
                  {items.length === 0 && <div className="text-xs text-muted-foreground italic px-2 py-3">Tidak ada lead</div>}
                  {items.map((l) => (
                    <div key={l.id} className="rounded-lg bg-card border border-border p-3 hover:shadow-soft transition-shadow">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-navy truncate">{l.nama}</div>
                        <StatusBadge tone={statusToTone(l.temperature)}>{l.temperature}</StatusBadge>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{l.produk}</div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">RM <span className="text-navy font-medium">{l.pic}</span></span>
                        <span className="text-primary font-medium">→ {l.nextFollowUp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Activity Effectiveness */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <Header title="Activity Management Effectiveness" caption="Conversion ratio aktivitas harian & mingguan." icon={Target} />
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {activityEffectiveness.map((a) => (
              <Donut key={a.name} label={a.name} value={a.value} target={a.target} />
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-navy text-navy-foreground p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold font-semibold">Effectiveness Score</div>
              <div className="text-2xl font-extrabold">75%</div>
              <div className="text-xs opacity-80">Rata-rata 3 dimensi aktivitas</div>
            </div>
            <Award className="h-12 w-12 text-gold opacity-70" />
          </div>
        </div>

        {/* 3. KPI MTD */}
        <div className="panel p-5">
          <Header title="Remedial & KPI Dashboard" caption="Identifikasi gap performa MTD." icon={TrendingDown} />
          <div className="mt-4 space-y-3">
            <KpiRow label="MTD Target" value={`${mtdKpi.target}`} tone="navy" />
            <KpiRow label="Actual MTD" value={`${mtdKpi.actual}`} tone="blue" />
            <KpiRow label="Gap" value={`${mtdKpi.gap}`} tone="red" />
            <div className="border-t border-border pt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Top Performer</span><span className="font-semibold text-navy">{mtdKpi.topPerformer}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Need Remedial</span><StatusBadge tone="red">{mtdKpi.needRemedial}</StatusBadge></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Coaching Priority</span><StatusBadge tone="gold"><GraduationCap className="h-3 w-3 mr-1" />{mtdKpi.coachingFocus}</StatusBadge></div>
            </div>
          </div>
        </div>
      </section>

      {/* Early Warning */}
      <section className="panel p-5">
        <Header title="Early Warning System" caption="Deteksi dini potensi underperformance." icon={AlertTriangle} />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {earlyWarnings.map((w, i) => (
            <div key={w} className="flex items-start gap-3 rounded-lg border border-border bg-gradient-to-r from-card to-danger-light/30 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-danger-light text-danger shrink-0 text-xs font-bold">!{i + 1}</div>
              <div className="text-sm text-navy">{w}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Header({ title, caption, icon: Icon }: { title: string; caption?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-bold text-navy">{title}</h3>
        {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      </div>
    </div>
  );
}

function Donut({ label, value, target }: { label: string; value: number; target: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const onTarget = value >= target;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none"
            stroke={onTarget ? "hsl(var(--success))" : "hsl(var(--gold))"}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold text-navy">{value}%</span>
          <span className="text-[10px] text-muted-foreground">target {target}%</span>
        </div>
      </div>
      <div className="mt-2 text-sm font-semibold text-navy">{label}</div>
    </div>
  );
}

function KpiRow({ label, value, tone }: { label: string; value: string; tone: "navy" | "blue" | "red" }) {
  const cls = tone === "red" ? "text-danger" : tone === "navy" ? "text-navy" : "text-primary";
  return (
    <div className="flex items-baseline justify-between rounded-lg bg-muted/40 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xl font-extrabold ${cls}`}>{value}</span>
    </div>
  );
}
