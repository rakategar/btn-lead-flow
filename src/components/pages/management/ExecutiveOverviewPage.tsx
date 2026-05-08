import { Wallet, Flame, Target, Activity, AlertTriangle, Trophy, ClipboardCheck, ArrowRight } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/auth";
import type { PageKey } from "@/components/AppShell";
import { branches, dailyRevenue, aiInsights, topContributors, activityCompliance } from "@/lib/dummy-data";
import { PageHero, SectionHead, PanelHeader, ProgressBar, statusToneFor, fmtRp, todayLabel } from "./_shared";

interface Props { user: SessionUser; onNavigate: (k: PageKey) => void }

export function ExecutiveOverviewPage({ user, onNavigate }: Props) {
  const totalPipeline = branches.reduce((s, b) => s + b.pipelineValue, 0);
  const totalClosing = branches.reduce((s, b) => s + b.closingMTD, 0);
  const totalTarget = branches.reduce((s, b) => s + b.target, 0);
  const closingPct = Math.round((totalClosing / totalTarget) * 100);
  const totalSales = branches.reduce((s, b) => s + b.salesCount, 0);
  const avgProductivity = Math.round(branches.reduce((s, b) => s + b.activityScore, 0) / branches.length);
  const hotLeads = 47;

  // Line chart
  const w = 720, h = 180, pad = 24;
  const maxY = Math.max(...dailyRevenue.flatMap((d) => [d.target, d.actual])) * 1.1;
  const xStep = (w - pad * 2) / (dailyRevenue.length - 1);
  const toPath = (key: "target" | "actual") =>
    dailyRevenue.map((d, i) => {
      const x = pad + i * xStep;
      const y = h - pad - (d[key] / maxY) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

  const ranked = [...branches].sort((a, b) => b.performanceScore - a.performanceScore);

  return (
    <div className="space-y-5">
      <PageHero
        title={`Halo, ${user.name}`}
        subtitle={`${todayLabel()} — ringkasan performa nasional lintas cabang.`}
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Pipeline Value" value={fmtRp(totalPipeline)} hint="Akumulasi seluruh cabang" icon={Wallet} tone="navy" />
        <KpiCard title="Total Hot Leads" value={hotLeads} hint="Probabilitas 70%–90%" icon={Flame} tone="orange" />
        <KpiCard title="Closing MTD vs Target" value={`${closingPct}%`} hint={`${fmtRp(totalClosing)} dari ${fmtRp(totalTarget)}`} icon={Target} tone="green" />
        <KpiCard title="Avg Productivity Officer" value={`${avgProductivity}%`} hint={`${totalSales} sales aktif`} icon={Activity} tone="blue" />
      </div>

      {/* Chart target vs actual */}
      <section className="panel p-5">
        <PanelHeader title="Target vs Actual Revenue" caption="Tren harian bulan berjalan (juta Rupiah)." icon={Activity} />
        <div className="mt-4 overflow-x-auto">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44 min-w-[640px]">
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1={pad} x2={w - pad} y1={h - pad - g * (h - pad * 2)} y2={h - pad - g * (h - pad * 2)} stroke="hsl(var(--muted))" strokeWidth="1" />
            ))}
            <path d={toPath("target")} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d={toPath("actual")} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
          </svg>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 bg-primary rounded-sm" />Actual</span>
          <span className="flex items-center gap-1.5"><span className="h-[2px] w-3 border-b border-dashed border-muted-foreground" />Target</span>
        </div>
      </section>

      {/* Ranking + Issues */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <PanelHeader title="Ranking Cabang" caption="Berdasarkan performance score MTD." icon={Trophy} />
          <div className="mt-4 space-y-2.5">
            {ranked.map((b, i) => (
              <div key={b.name} className="rounded-lg border border-border p-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-gold text-xs font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-navy truncate">{b.name}</span>
                    <StatusBadge tone={statusToneFor(b.status)}>{b.status}</StatusBadge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Leader {b.leader} · {b.salesCount} sales · {fmtRp(b.closingMTD)} closing</div>
                  <div className="mt-1.5"><ProgressBar pct={b.performanceScore} tone={b.status === "Healthy" ? "success" : b.status === "Watchlist" ? "gold" : "danger"} /></div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-navy">{b.performanceScore}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <PanelHeader title="AI Key Issues" caption="Masalah utama hari ini." icon={AlertTriangle} />
          <ul className="mt-4 space-y-2.5">
            {aiInsights.keyIssues.map((k) => (
              <li key={k} className="flex items-start gap-2 rounded-lg bg-danger-light/50 border border-danger-light p-2.5">
                <AlertTriangle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
                <span className="text-sm text-navy">{k}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onNavigate("mgmt-ai")}>
            Lihat AI Insight Center <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Top Contributor + Activity Compliance */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <PanelHeader title="Top Contributor Minggu Ini" caption="Lima penyumbang closing terbesar." icon={Trophy} />
          <div className="mt-4 space-y-2">
            {topContributors.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-gold text-xs font-bold">{c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-navy truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.branch} · {c.closing} closing</div>
                </div>
                <StatusBadge tone="gold">#{i + 1}</StatusBadge>
                <div className="text-sm font-bold text-navy w-10 text-right">{c.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <PanelHeader title="Activity Compliance" caption={`${activityCompliance.updated} dari ${activityCompliance.total} sales sudah update hari ini.`} icon={ClipboardCheck} />
          <div className="mt-4 space-y-2.5">
            {activityCompliance.branches.map((b) => {
              const pct = Math.round((b.updated / b.total) * 100);
              return (
                <div key={b.name} className="rounded-lg border border-border p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-navy">{b.name}</span>
                    <span className="text-xs text-muted-foreground">{b.updated}/{b.total} · {pct}%</span>
                  </div>
                  <div className="mt-2"><ProgressBar pct={pct} tone={pct >= 80 ? "success" : pct >= 60 ? "gold" : "danger"} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
