import { Users, Activity, Bell, TrendingUp, Star, Target, ArrowRight, CheckCircle2, AlertTriangle, Trophy, AlertCircle } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { pipelineSummary, priorityAlerts, picActivities, leaders, type Lead } from "@/lib/dummy-data";
import type { PageKey } from "@/components/AppShell";
import type { SessionUser } from "@/lib/auth";

const actPillars = [
  { letter: "A", title: "Action Daily", desc: "Aktivitas nyata harian: prospecting, kunjungan, follow-up, appointment.", tone: "blue" as const },
  { letter: "C", title: "Control Activity", desc: "Kontrol kualitas aktivitas dan fokus pada langkah yang menghasilkan closing.", tone: "gold" as const },
  { letter: "T", title: "Track Progress", desc: "Pencatatan progres untuk coaching, evaluasi, dan perbaikan berkelanjutan.", tone: "navy" as const },
];

interface Props {
  onNavigate: (k: PageKey) => void;
  user: SessionUser;
  leads: Lead[];
}

export function OverviewPage({ onNavigate, user, leads }: Props) {
  const isLeader = user.role === "leader";

  // Scope aktivitas tim untuk leader / RM untuk dirinya
  const teamRMs = isLeader
    ? (leaders.find((l) => l.name === user.name)?.rms ?? [])
    : [user.name];
  const acts = picActivities.filter((p) => teamRMs.includes(p.pic));
  const totalActs = acts.reduce((s, a) => s + a.prospecting + a.followUp + a.meeting + a.closing, 0);
  const totalClose = acts.reduce((s, a) => s + a.closing, 0);
  const totalLeads = leads.length;
  const closedLeads = leads.filter((l) => l.status === "Close").length;
  const followUpDue = leads.filter((l) => l.nextFollowUp === "Hari ini" || l.nextFollowUp === "Besok").length;
  const conv = totalLeads ? Math.round((closedLeads / totalLeads) * 100) : 0;

  // Highlight anggota
  const score = (a: typeof acts[number]) => a.prospecting + a.followUp + a.meeting + a.closing * 2;
  const sorted = [...acts].sort((a, b) => score(b) - score(a));
  const topPerformer = sorted[0];
  const needAttention = sorted[sorted.length - 1];

  const greetingSub = isLeader
    ? "Pantau performa tim dan dorong closing lebih banyak hari ini."
    : "Fokus pada aktivitas hari ini untuk capai targetmu.";
  const roleLabel = isLeader ? "Sales Leader" : "Sales Team";
  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="panel p-5 sm:p-6 bg-gradient-to-r from-primary-light/60 via-card to-card border-l-4 border-l-primary">
        <div className="text-xs uppercase tracking-wider font-semibold text-primary">{roleLabel}</div>
        <h2 className="mt-1 text-xl sm:text-2xl font-bold text-navy">Halo, {user.name} — {roleLabel}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{greetingSub}</p>
      </div>

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

      {/* KPI — role based */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title={isLeader ? "Total Leads Tim" : "Leads Saya"} value={totalLeads} hint={isLeader ? "Akumulasi seluruh RM tim" : "Lead yang menjadi tanggung jawab Anda"} icon={Users} tone="blue" />
        <KpiCard title={isLeader ? "Aktivitas Tim Hari Ini" : "Aktivitas Saya Hari Ini"} value={totalActs} hint="Prospecting, FU, meeting, closing" icon={Activity} tone="navy" />
        <KpiCard title="Follow-Up Due" value={followUpDue} hint="Perlu tindak lanjut segera" icon={Bell} tone="orange" />
        <KpiCard title="Conversion Rate" value={`${conv}%`} hint="Dari lead ke close" icon={TrendingUp} tone="green" />
        <KpiCard title={isLeader ? "Lead Prioritas High" : "Prioritas High Saya"} value={leads.filter((l) => l.priority === "High").length} hint="Probabilitas 70%–90%" icon={Star} tone="orange" />
        <KpiCard title="Gap to Target" value={isLeader ? "-12%" : "-8%"} hint="Perlu remedial action" icon={Target} tone="navy" delta={{ value: isLeader ? "-3pt" : "-1pt", up: false }} />
      </div>

      {/* Insight tim — leader only */}
      {isLeader && topPerformer && needAttention && (
        <section>
          <SectionHead title="Insight Tim" caption="Highlight performa anggota tim Anda." />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="panel p-4 border-l-4 border-l-success flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-success-light text-success flex items-center justify-center shrink-0"><Trophy className="h-4.5 w-4.5" /></div>
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Top performer</div>
                <div className="text-base font-bold text-navy">{topPerformer.pic}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Prospecting {topPerformer.prospecting} · FU {topPerformer.followUp} · Meeting {topPerformer.meeting} · Closing {topPerformer.closing}</div>
              </div>
              <StatusBadge tone="green">{topPerformer.disiplin}</StatusBadge>
            </div>
            <div className="panel p-4 border-l-4 border-l-danger flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><AlertCircle className="h-4.5 w-4.5" /></div>
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Butuh perhatian</div>
                <div className="text-base font-bold text-navy">{needAttention.pic}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Aktivitas rendah · butuh coaching dan dorongan follow-up.</div>
              </div>
              <StatusBadge tone="red">{needAttention.disiplin}</StatusBadge>
            </div>
          </div>
        </section>
      )}

      {/* Ringkasan tim — leader only */}
      {isLeader && (
        <section>
          <SectionHead title="Ringkasan Performa Tim" caption="Aktivitas per RM dalam tim Anda." />
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left font-semibold px-5 py-3">RM</th>
                    <th className="text-left font-semibold px-5 py-3">Prospecting</th>
                    <th className="text-left font-semibold px-5 py-3">Follow-Up</th>
                    <th className="text-left font-semibold px-5 py-3">Meeting</th>
                    <th className="text-left font-semibold px-5 py-3">Closing</th>
                    <th className="text-left font-semibold px-5 py-3">Disiplin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {acts.map((a) => (
                    <tr key={a.pic} className="hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium text-navy">{a.pic}</td>
                      <td className="px-5 py-3">{a.prospecting}</td>
                      <td className="px-5 py-3">{a.followUp}</td>
                      <td className="px-5 py-3">{a.meeting}</td>
                      <td className="px-5 py-3">{a.closing}</td>
                      <td className="px-5 py-3"><StatusBadge tone={a.disiplin === "Sangat Baik" ? "green" : a.disiplin === "Baik" ? "blue" : "orange"}>{a.disiplin}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Progress pribadi — RM only */}
      {!isLeader && (
        <section>
          <SectionHead title="Progres Saya Hari Ini" caption="Ringkasan aktivitas pribadi Anda." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {acts[0] ? (
              <>
                <MiniStat label="Prospecting" value={acts[0].prospecting} />
                <MiniStat label="Follow-Up" value={acts[0].followUp} />
                <MiniStat label="Meeting" value={acts[0].meeting} />
                <MiniStat label="Closing" value={acts[0].closing} />
              </>
            ) : (
              <div className="panel p-4 text-sm text-muted-foreground sm:col-span-2 lg:col-span-4">Belum ada aktivitas tercatat.</div>
            )}
          </div>
        </section>
      )}

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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-navy">{value}</div>
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
