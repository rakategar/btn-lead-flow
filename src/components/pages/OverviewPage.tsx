import { Users, Activity, Bell, TrendingUp, Star, Target, ArrowRight, CheckCircle2, AlertTriangle, Trophy, AlertCircle, ChevronRight, Clock } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { pipelineSummary, priorityAlerts, picActivities, leaders, type Lead, type RmActivity } from "@/lib/dummy-data";
import type { PageKey } from "@/components/AppShell";
import type { SessionUser } from "@/lib/auth";
import { AiPriorityToday, AiEarlyWarningPanel } from "@/components/ai/AiPanels";
import { TeamAlertPanel } from "@/components/ai/TeamAlertPanel";

const actPillars = [
  { letter: "A", title: "Action Daily", desc: "Aktivitas nyata harian: prospecting, kunjungan, follow-up, appointment.", tone: "blue" as const },
  { letter: "C", title: "Control Activity", desc: "Kontrol kualitas aktivitas dan fokus pada langkah yang menghasilkan closing.", tone: "gold" as const },
  { letter: "T", title: "Track Progress", desc: "Pencatatan progres untuk coaching, evaluasi, dan perbaikan berkelanjutan.", tone: "navy" as const },
];

interface Props {
  onNavigate: (k: PageKey) => void;
  user: SessionUser;
  leads: Lead[];
  activities?: RmActivity[];
}

export function OverviewPage({ onNavigate, user, leads, activities = [] }: Props) {
  const isLeader = user.role === "leader";

  // Scope aktivitas tim untuk leader / RM untuk dirinya
  const teamRMs = isLeader
    ? (leaders.find((l) => l.name === user.name)?.rms ?? [])
    : [user.name];
  const acts = picActivities.filter((p) => teamRMs.includes(p.pic));

  // Hitung progres aktivitas langsung dari data Pipeline & Leads,
  // sehingga angka di Overview konsisten dengan halaman Pipeline & Leads.
  const progress = {
    prospecting: leads.filter((l) => l.stage === "Contact").length,
    followUp: leads.filter((l) => l.status === "Follow Up").length,
    meeting: leads.filter((l) => l.stage === "Meet").length,
    closing: leads.filter((l) => l.stage === "Close" || l.status === "Close").length,
  };
  const todayKey = new Date().toDateString();
  const todayActsCount = activities.filter((a) => new Date(a.datetime).toDateString() === todayKey).length;
  const totalActs = todayActsCount > 0 ? todayActsCount : (progress.prospecting + progress.followUp + progress.meeting + progress.closing);
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
  const roleLabel = isLeader ? "Leader" : "RM";
  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="panel p-5 sm:p-6 bg-gradient-to-r from-primary-light/60 via-card to-card border-l-4 border-l-primary">
        <div className="text-xs uppercase tracking-wider font-semibold text-primary">{roleLabel}</div>
        <h2 className="mt-1 text-xl sm:text-2xl font-bold text-navy">Halo, {user.name} — {roleLabel}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{greetingSub}</p>
      </div>

      {/* AI: Prioritas Hari Ini & Alert (Leader: Alert Tim, RM: Early Warning Personal) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AiPriorityToday leads={leads} onNavigatePipeline={() => onNavigate("pipeline")} />
        {isLeader ? (
          <TeamAlertPanel leaderName={user.name} leads={leads} activities={activities} />
        ) : (
          <AiEarlyWarningPanel leads={leads} onOpenLead={() => onNavigate("pipeline")} />
        )}
      </div>

      {/* Hero */}
      <div className="panel p-5 sm:p-6 bg-gradient-to-br from-card via-card to-primary-light/40 border-l-4 border-l-primary">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <StatusBadge tone="blue">Prototype visual — data dummy</StatusBadge>
              <StatusBadge tone="navy">Konsep A.C.T</StatusBadge>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-navy">A.C.T untuk Visibilitas Aktivitas, Pipeline, dan Result</h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              Dashboard konsep untuk memantau aktivitas harian, progres pipeline, follow-up, dan indikator performa sales dalam satu tampilan sederhana.
            </p>
          </div>
          <Button
            onClick={() => onNavigate("command")}
            className="bg-[#005bfd] hover:bg-[#0048d4] text-white font-semibold transition-all hover:shadow-[0_4px_12px_rgba(0,91,253,0.25)]"
          >
            Buka Command Center <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* KPI — role based */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title={isLeader ? "Total Leads Tim" : "Leads Saya"} value={totalLeads} hint={isLeader ? "Akumulasi seluruh RM tim" : "Lead yang menjadi tanggung jawab Anda"} icon={Users} tone="blue" />
        <KpiCard title={isLeader ? "Aktivitas Tim Hari Ini" : "Aktivitas Saya Hari Ini"} value={totalActs} hint="Prospecting, FU, meeting, closing" icon={Activity} tone="navy" />
        <KpiCard title="Follow-Up Due" value={followUpDue} hint="Perlu tindak lanjut segera" icon={Bell} tone="blue" />
        <KpiCard title="Conversion Rate" value={`${conv}%`} hint="Dari lead ke close" icon={TrendingUp} tone="blue" />
        <KpiCard title={isLeader ? "Lead Prioritas High" : "Prioritas High Saya"} value={leads.filter((l) => l.priority === "High").length} hint="Probabilitas 70%–90%" icon={Star} tone={leads.filter((l) => l.priority === "High").length > 0 ? "blue" : "muted"} />
        <GapToTargetCard isLeader={isLeader} />
      </div>

      {/* Insight tim — leader only */}
      {isLeader && topPerformer && needAttention && (
        <section>
          <SectionHead title="Insight Tim" caption="Highlight performa anggota tim Anda." />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="panel p-4 border-l-4 border-l-primary flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0"><Trophy className="h-4.5 w-4.5" /></div>
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Top performer</div>
                <div className="text-base font-bold text-navy">{topPerformer.pic}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Prospecting {topPerformer.prospecting} · FU {topPerformer.followUp} · Meeting {topPerformer.meeting} · Closing {topPerformer.closing}</div>
              </div>
              <StatusBadge tone="blue">{topPerformer.disiplin}</StatusBadge>
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
                      <td className="px-5 py-3"><StatusBadge tone={a.disiplin === "Sangat Baik" ? "blue" : a.disiplin === "Baik" ? "blue" : "red"}>{a.disiplin}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Progress pribadi — RM only (sumber: Pipeline & Leads) */}
      {!isLeader && (
        <section>
          <SectionHead title="Progres Saya Hari Ini" caption="Ringkasan langsung dari data Pipeline & Leads Anda." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Prospecting" value={progress.prospecting} />
            <MiniStat label="Follow-Up" value={progress.followUp} />
            <MiniStat label="Meeting" value={progress.meeting} />
            <MiniStat label="Closing" value={progress.closing} />
          </div>
        </section>
      )}

      {/* A. Fondasi A.C.T */}
      <section>
        <SectionHead title="Fondasi A.C.T" caption="Tiga pilar yang menggerakkan transformasi sales." />
        <div className="grid gap-4 md:grid-cols-3">
          {actPillars.map((p) => (
            <div key={p.letter} className="rounded-xl border border-dashed border-border bg-[#fafbff] p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-extrabold ${
                  p.tone === "navy" ? "bg-navy text-white" : "bg-primary-light text-primary"
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
          {(() => {
            const maxCount = Math.max(...pipelineSummary.map((s) => s.count));
            return (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pipelineSummary.map((s, i) => (
                  <div key={s.stage} className="relative rounded-xl border border-border p-4 bg-gradient-to-br from-card to-muted/30">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stage {i + 1}</div>
                    <div className="mt-1 text-base font-bold text-navy">{s.stage}</div>
                    <div className="mt-2 text-3xl font-extrabold text-navy">{s.count}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.caption}</div>
                    <div className="mt-3 relative h-[4px] rounded-[2px] bg-[#e2e8f0]">
                      <div className="absolute left-0 top-0 h-full rounded-[2px] bg-[#005bfd]" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                      <span className="absolute right-0 -top-4 text-[11px] text-[#64748b]">{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* C. Prioritas Hari Ini */}
      <section>
        <SectionHead title="Ringkasan Prioritas Hari Ini" caption="Lead perlu tindak lanjut, FU eskalasi, dan gap aktivitas." />
        <div className="grid gap-3 sm:grid-cols-2">
          {priorityAlerts.map((a) => {
            const v = a.toLowerCase();
            const isRed = /hot|aksi cepat|kritis|segera/.test(v);
            const isBlueTarget = /gap|pic|aktivitas|target/.test(v);
            const bgIcon = isRed ? "rgba(255,0,0,0.1)" : "rgba(0,91,253,0.1)";
            const iconColor = isRed ? "#ff0000" : "#005bfd";
            const IconEl = isRed ? AlertTriangle : isBlueTarget ? Target : Clock;
            return (
              <div
                key={a}
                className="group panel p-4 flex items-center gap-3 cursor-pointer hover:bg-[#f8faff] transition-colors"
                onClick={() => onNavigate("followup")}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] shrink-0" style={{ backgroundColor: bgIcon }}>
                  <IconEl className="h-4 w-4" style={{ color: iconColor }} />
                </div>
                <div className="flex-1 text-sm font-medium text-navy">{a}</div>
                <ChevronRight className="h-4 w-4 text-[#94a3b8] group-hover:text-[#005bfd] transition-colors shrink-0" />
              </div>
            );
          })}
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

function GapToTargetCard({ isLeader }: { isLeader: boolean }) {
  const gapValue = isLeader ? "-12%" : "-8%";
  const trendValue = isLeader ? "-3pt dari kemarin" : "-1pt dari kemarin";
  const isNegative = gapValue.startsWith("-");
  const valueColor = isNegative ? "#ff0000" : "#005bfd";
  return (
    <div className="kpi-card">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/10 text-navy">
        <Target className="h-4.5 w-4.5" />
      </div>
      <div className="mt-4">
        <div className="text-sm" style={{ color: "#64748b" }}>Gap to Target</div>
        <div className="mt-1 text-[28px] font-bold leading-tight" style={{ color: valueColor }}>{gapValue}</div>
        <div className="mt-0.5 text-[11px]" style={{ color: valueColor }}>{trendValue}</div>
        <div className="mt-1 text-xs" style={{ color: "#64748b" }}>Perlu remedial action</div>
      </div>
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
