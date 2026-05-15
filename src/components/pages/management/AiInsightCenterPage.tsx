import { useState } from "react";
import { Brain, Lightbulb, AlertTriangle, TrendingUp, Sparkles, Activity, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { aiInsights, aiRecommendations, pipelineHealth30d, branches } from "@/lib/dummy-data";
import { PageHero, PanelHeader } from "./_shared";

const summaryBlocks = [
  { key: "situation", title: "Current Situation",   icon: Activity,        items: aiInsights.situation,   tone: "bg-primary-light text-primary" },
  { key: "issues",    title: "Key Issues",          icon: AlertTriangle,   items: aiInsights.keyIssues,   tone: "bg-danger-light text-danger" },
  { key: "improve",   title: "Need to be Improved", icon: Lightbulb,       items: aiInsights.improve,     tone: "bg-gold-light text-[hsl(var(--gold))]" },
  { key: "grow",      title: "Continue to Grow",    icon: TrendingUp,      items: aiInsights.grow,        tone: "bg-success-light text-success" },
];

export function AiInsightCenterPage() {
  const [branch, setBranch] = useState(branches[0].name);
  const [plan, setPlan] = useState<{ step: string; owner: string; due: string }[] | null>(null);

  const generate = () => {
    setPlan([
      { step: `Audit pipeline & hot lead di ${branch}`, owner: "Leader cabang",   due: "3 hari" },
      { step: "Coaching closing & objection handling",   owner: "Leader + 2 RM senior", due: "1 minggu" },
      { step: "Reassign 5 hot lead ke top performer",    owner: "Leader",          due: "2 hari" },
      { step: "Review weekly progress & sprint FU",      owner: "Senior Leader + Leader",   due: "2 minggu" },
    ]);
    toast.success("AI Remedial Plan dihasilkan", { description: `Untuk ${branch}` });
  };

  // sparkline
  const w = 600, h = 120, pad = 12;
  const max = Math.max(...pipelineHealth30d), min = Math.min(...pipelineHealth30d);
  const xStep = (w - pad * 2) / (pipelineHealth30d.length - 1);
  const path = pipelineHealth30d.map((v, i) => {
    const x = pad + i * xStep;
    const y = h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="space-y-5">
      <PageHero title="AI Insight Center" subtitle="AI Executive Summary, rekomendasi, dan generator remedial plan." />

      {/* Executive Summary */}
      <section className="grid gap-4 md:grid-cols-2">
        {summaryBlocks.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.key} className="panel p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${b.tone}`}><Icon className="h-5 w-5" /></div>
                <div><h4 className="font-bold text-navy">{b.title}</h4><p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">AI Executive Summary</p></div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-navy">
                {b.items.map((it) => (
                  <li key={it} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{it}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Recommendations */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><h3 className="text-base font-bold text-navy">Rekomendasi AI</h3><p className="text-xs text-muted-foreground">Tindakan yang disarankan untuk minggu ini.</p></div>
          <StatusBadge tone="gold"><Sparkles className="h-3 w-3 mr-1" />AI Generated</StatusBadge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {aiRecommendations.map((r) => (
            <div key={r.title} className="panel p-4 flex flex-col">
              <div className="flex items-start gap-2"><Lightbulb className="h-4 w-4 text-[hsl(var(--gold))] mt-0.5" /><div className="text-sm font-bold text-navy">{r.title}</div></div>
              <p className="mt-2 text-xs text-muted-foreground">{r.context}</p>
              <div className="mt-3 text-xs text-navy"><span className="font-semibold">Action: </span>{r.action}</div>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => toast.success("Rekomendasi diterapkan", { description: r.title })}>Terapkan</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline health 30d */}
      <section className="panel p-5">
        <PanelHeader title="Pipeline Health Score · 30 Hari" caption="Tren skor kesehatan pipeline harian." icon={Activity} />
        <div className="mt-4 overflow-x-auto">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32 min-w-[480px]">
            <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
          </svg>
        </div>
      </section>

      {/* AI Remedial Plan */}
      <section className="panel p-5">
        <PanelHeader title="AI Remedial Plan Generator" caption="Pilih cabang, AI akan menyusun action plan dengan timeline dan owner." icon={Wand2} />
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background">
            {branches.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
          <Button onClick={generate} className="bg-navy hover:bg-navy/90 text-navy-foreground"><Wand2 className="h-4 w-4 mr-1.5" />Generate Plan</Button>
        </div>
        {plan && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-primary">Action Plan · {branch}</div>
            {plan.map((p, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3 flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-navy text-gold text-xs font-bold shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-navy">{p.step}</div>
                  <div className="text-[11px] text-muted-foreground">Owner: {p.owner} · Timeline: {p.due}</div>
                </div>
              </div>
            ))}
            <Button size="sm" className="bg-[hsl(var(--gold))] text-navy hover:bg-[hsl(var(--gold))]/90 font-semibold" onClick={() => toast.success("Plan terkirim ke Leader cabang", { description: branch })}>
              Kirim ke Leader Cabang
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
