import { HeartPulse, Flame, Droplet, Snowflake, Hourglass, TrendingDown } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { pipelineHealthBreakdown, stageAging, conversionDiagnosis, type Lead } from "@/lib/dummy-data";
import { PageHero, PanelHeader, ProgressBar } from "./_shared";

interface Props { leads: Lead[] }

export function PipelineIntelligencePage({ leads }: Props) {
  const overall = Math.round(pipelineHealthBreakdown.reduce((s, d) => s + d.score, 0) / pipelineHealthBreakdown.length);

  // Hot/Warm/Cold counts
  const counts = { Hot: 0, Warm: 0, Cold: 0 } as Record<"Hot" | "Warm" | "Cold", number>;
  const map: Record<string, "Hot" | "Warm" | "Cold"> = { High: "Hot", Medium: "Warm", Low: "Cold" };
  leads.forEach((l) => { counts[map[l.priority]]++; });
  const total = Math.max(1, leads.length);

  // Donut math
  const r = 50, c = 2 * Math.PI * r;
  const segs = (["Hot", "Warm", "Cold"] as const).map((k) => ({ k, frac: counts[k] / total }));
  let acc = 0;

  // Gauge for overall
  const gaugeR = 48, gaugeC = 2 * Math.PI * gaugeR;
  const gaugeDash = (overall / 100) * gaugeC;

  return (
    <div className="space-y-5">
      <PageHero title="Pipeline Intelligence" subtitle="Health score, distribusi temperatur, stage aging, dan diagnosis konversi." />

      {/* Health */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="panel p-5">
          <PanelHeader title="Pipeline Health Score" caption="Skor keseluruhan pipeline nasional." icon={HeartPulse} />
          <div className="mt-4 flex items-center justify-center">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r={gaugeR} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                <circle cx="60" cy="60" r={gaugeR} fill="none" stroke={overall >= 75 ? "hsl(var(--success))" : overall >= 60 ? "hsl(var(--gold))" : "hsl(var(--danger))"} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${gaugeDash} ${gaugeC}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-navy">{overall}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">overall</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-5 lg:col-span-2">
          <PanelHeader title="Breakdown Dimensi" caption="Empat dimensi penyusun health score." icon={HeartPulse} />
          <div className="mt-4 space-y-3">
            {pipelineHealthBreakdown.map((d) => {
              const ok = d.score >= d.benchmark;
              return (
                <div key={d.name} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-sm font-semibold text-navy">{d.name}</div>
                    <div className="text-xs text-muted-foreground"><span className={cn("font-bold", ok ? "text-success" : "text-danger")}>{d.score}</span> · benchmark {d.benchmark}</div>
                  </div>
                  <ProgressBar pct={d.score} tone={ok ? "success" : "danger"} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Distribusi temperatur */}
      <section className="panel p-5">
        <PanelHeader title="Distribusi Lead Hot / Warm / Cold" caption="Komposisi temperatur lead nasional." icon={Flame} />
        <div className="mt-4 grid gap-5 lg:grid-cols-2 items-center">
          <div className="flex items-center justify-center">
            <div className="relative h-48 w-48">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                {segs.map((s) => {
                  const dash = s.frac * c;
                  const off = -acc;
                  acc += dash;
                  const color = s.k === "Hot" ? "hsl(var(--danger))" : s.k === "Warm" ? "hsl(var(--accent))" : "hsl(var(--primary))";
                  return <circle key={s.k} cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="14" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={off} />;
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-navy">{leads.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">total lead</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {(["Hot", "Warm", "Cold"] as const).map((k) => {
              const Icon = k === "Hot" ? Flame : k === "Warm" ? Droplet : Snowflake;
              const tone = k === "Hot" ? "red" : k === "Warm" ? "orange" : "blue";
              const items = leads.filter((l) => map[l.priority] === k).slice(0, 4);
              return (
                <div key={k} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2"><Icon className={cn("h-4 w-4", k === "Hot" ? "text-danger" : k === "Warm" ? "text-accent" : "text-primary")} /><span className="font-semibold text-navy">{k}</span></div>
                    <StatusBadge tone={tone as any}>{counts[k]} · {Math.round((counts[k] / total) * 100)}%</StatusBadge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{items.map((i) => i.nama).join(" · ") || "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stage Aging */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold"><Hourglass className="h-4 w-4" /></div>
          <div><h3 className="font-bold text-navy">Stage Aging per Cabang</h3><p className="text-xs text-muted-foreground">Rata-rata hari lead stagnan di tiap stage.</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-5 py-3">Cabang</th><th className="text-center px-3 py-3">Contact</th><th className="text-center px-3 py-3">Meet</th><th className="text-center px-3 py-3">Prospect</th><th className="text-center pr-5 py-3">Close</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stageAging.map((s) => (
                <tr key={s.branch} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-navy">{s.branch}</td>
                  <td className="px-3 py-3 text-center">{s.contact}d</td>
                  <td className="px-3 py-3 text-center">{s.meet}d</td>
                  <td className={cn("px-3 py-3 text-center font-semibold", s.prospect > 10 ? "text-danger" : "text-navy")}>{s.prospect}d</td>
                  <td className="pr-5 py-3 text-center">{s.close}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Conversion Diagnosis */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold"><TrendingDown className="h-4 w-4" /></div>
          <div><h3 className="font-bold text-navy">Conversion Diagnosis</h3><p className="text-xs text-muted-foreground">Tahap mana paling banyak drop di tiap cabang.</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-5 py-3">Cabang</th><th className="text-left px-3 py-3">Drop Stage</th><th className="text-right pr-5 py-3">Drop %</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {conversionDiagnosis.map((c) => (
                <tr key={c.branch} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-navy">{c.branch}</td>
                  <td className="px-3 py-3"><StatusBadge tone="navy">{c.dropStage}</StatusBadge></td>
                  <td className="pr-5 py-3 text-right font-semibold text-danger">{c.dropPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
