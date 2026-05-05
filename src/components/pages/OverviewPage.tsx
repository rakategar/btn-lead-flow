import { Users, Activity, Bell, TrendingUp, Star, Target, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { pipelineSummary, priorityAlerts } from "@/lib/dummy-data";
import type { PageKey } from "@/components/AppShell";

const actPillars = [
  { letter: "A", title: "Action Daily", desc: "Aktivitas nyata harian: prospecting, kunjungan, follow-up, appointment.", tone: "blue" as const },
  { letter: "C", title: "Control Activity", desc: "Kontrol kualitas aktivitas dan fokus pada langkah yang menghasilkan closing.", tone: "gold" as const },
  { letter: "T", title: "Track Progress", desc: "Pencatatan progres untuk coaching, evaluasi, dan perbaikan berkelanjutan.", tone: "navy" as const },
];

interface Props { onNavigate: (k: PageKey) => void }

export function OverviewPage({ onNavigate }: Props) {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="panel p-5 sm:p-6 bg-gradient-to-br from-card via-card to-primary-light/40 border-l-4 border-l-[hsl(var(--gold))]">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <StatusBadge tone="gold">Prototype visual — data dummy</StatusBadge>
              <StatusBadge tone="navy">Konsep A.C.T</StatusBadge>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-navy">A.C.T untuk Visibilitas Aktivitas, Pipeline, dan Result</h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              Dashboard konsep untuk memantau aktivitas harian, progres pipeline, follow-up, dan indikator performa sales dalam satu tampilan sederhana.
            </p>
          </div>
          <Button onClick={() => onNavigate("command")} className="bg-navy hover:bg-navy/90 text-navy-foreground">
            Buka Command Center <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Total Leads Aktif" value="128" hint="Tersebar di seluruh pipeline" icon={Users} tone="blue" delta={{ value: "+6%", up: true }} />
        <KpiCard title="Aktivitas Hari Ini" value="76" hint="Prospecting, FU, meeting" icon={Activity} tone="navy" delta={{ value: "+12%", up: true }} />
        <KpiCard title="Follow-Up Due Today" value="18" hint="Perlu tindak lanjut hari ini" icon={Bell} tone="orange" />
        <KpiCard title="Conversion Rate" value="24%" hint="Dari prospect ke close" icon={TrendingUp} tone="green" delta={{ value: "+2pt", up: true }} />
        <KpiCard title="Lead Prioritas High" value="21" hint="Probabilitas 70%–90%" icon={Star} tone="orange" />
        <KpiCard title="Gap to Target" value="-12%" hint="Perlu remedial action" icon={Target} tone="navy" delta={{ value: "-3pt", up: false }} />
      </div>

      {/* A. Fondasi A.C.T */}
      <section>
        <SectionHead title="Fondasi A.C.T" caption="Tiga pilar yang menggerakkan transformasi sales." />
        <div className="grid gap-4 md:grid-cols-3">
          {actPillars.map((p) => (
            <div key={p.letter} className="panel p-5 hover:shadow-card transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-extrabold ${
                  p.tone === "gold" ? "bg-gold-light text-[hsl(var(--gold))]" :
                  p.tone === "navy" ? "bg-navy text-gold" :
                  "bg-primary-light text-primary"
                }`}>{p.letter}</div>
                <div>
                  <div className="text-base font-bold text-navy">{p.title}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">A.C.T Pillar</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* B. Pipeline Ringkas */}
      <section>
        <SectionHead title="Pipeline Ringkas" caption="Pipeline menunjukkan perjalanan konversi dari interaksi awal hingga transaksi." action={
          <Button variant="outline" size="sm" onClick={() => onNavigate("pipeline")}>Lihat detail <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
        } />
        <div className="panel p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pipelineSummary.map((s, i) => (
              <div key={s.stage} className="relative rounded-xl border border-border p-4 bg-gradient-to-br from-card to-muted/30">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stage {i + 1}</div>
                <div className="mt-1 text-base font-bold text-navy">{s.stage}</div>
                <div className="mt-2 text-3xl font-extrabold text-navy">{s.count}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.caption}</div>
                <div className={`mt-3 h-1.5 rounded-full ${i === 3 ? "bg-success" : i >= 2 ? "bg-[hsl(var(--gold))]" : "bg-primary"}`} style={{ width: `${100 - i * 18}%` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* C. Prioritas Hari Ini */}
      <section>
        <SectionHead title="Ringkasan Prioritas Hari Ini" caption="Lead perlu tindak lanjut, FU eskalasi, dan gap aktivitas." />
        <div className="grid gap-3 sm:grid-cols-2">
          {priorityAlerts.map((a, i) => (
            <div key={a} className="panel p-4 flex items-start gap-3">
              <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${i === 2 ? "bg-danger-light text-danger" : i === 0 ? "bg-accent-light text-accent" : "bg-gold-light text-[hsl(var(--gold))]"}`}>
                {i === 2 ? <AlertTriangle className="h-4 w-4" /> : i === 3 ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-navy">{a}</div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => onNavigate("followup")}>Lihat</Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, caption, action }: { title: string; caption?: string; action?: React.ReactNode }) {
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
