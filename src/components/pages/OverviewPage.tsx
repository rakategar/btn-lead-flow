import { Users, Home, Clock, AlertTriangle, ArrowRightLeft, Phone, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { aktivitas, alerts, pipelineStages } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

const toneBg = {
  blue: "bg-primary",
  orange: "bg-accent",
  green: "bg-success",
};

export function OverviewPage() {
  const total = pipelineStages[0].count;

  return (
    <div className="space-y-6">
      {/* Hero intro */}
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-navy">Ringkasan hari ini</h2>
              <StatusBadge tone="orange" dot>Prototype visual — data dummy</StatusBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
              Dashboard konsep untuk membantu Bank BTN melihat pipeline lead KPR, hubungan nasabah,
              tindak lanjut cabang, dan SLA layanan dalam satu tampilan sederhana.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Total Lead Bulan Ini" value="1.248" hint="Lead baru dari channel digital dan cabang" delta={{ value: "8,2%", up: true }} icon={Users} tone="blue" />
        <KpiCard title="Lead KPR Aktif" value="386" hint="Masih dalam proses follow-up" delta={{ value: "3,1%", up: true }} icon={Home} tone="navy" />
        <KpiCard title="SLA Tepat Waktu" value="92%" hint="Target internal: >90%" delta={{ value: "1,4%", up: true }} icon={Clock} tone="green" />
        <KpiCard title="Case Terbuka" value="47" hint="Perlu tindak lanjut CS/cabang" delta={{ value: "5", up: false }} icon={AlertTriangle} tone="orange" />
        <KpiCard title="Konversi ke Pengajuan" value="28%" hint="Dari lead menjadi pengajuan KPR" delta={{ value: "2,3%", up: true }} icon={ArrowRightLeft} tone="blue" />
        <KpiCard title="Follow-up Hari Ini" value="63" hint="Prioritas untuk hari ini" delta={{ value: "12", up: true }} icon={Phone} tone="orange" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* A. Pipeline */}
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-navy">Ringkasan Pipeline Lead KPR</h3>
              <p className="text-xs text-muted-foreground">Membantu visibilitas pipeline KPR dari lead hingga akad.</p>
            </div>
            <span className="text-xs text-muted-foreground">Periode: April 2026</span>
          </div>

          <div className="mt-5 space-y-3">
            {pipelineStages.map((s, i) => {
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span className="font-medium text-navy">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums text-navy">{s.count.toLocaleString("id-ID")}</span>
                      <span className="text-muted-foreground tabular-nums w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", toneBg[s.tone])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="text-xs"><span className="text-muted-foreground">Conversion lead→akad</span><div className="font-semibold text-navy">6,9%</div></div>
            <div className="text-xs"><span className="text-muted-foreground">Avg. response time</span><div className="font-semibold text-navy">3 jam 12 mnt</div></div>
            <div className="text-xs"><span className="text-muted-foreground">Backlog tertinggi</span><div className="font-semibold text-navy">KC Tangerang</div></div>
          </div>
        </div>

        {/* C. Alerts */}
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-navy">Alert Prioritas</h3>
            <StatusBadge tone="orange">{alerts.length} item</StatusBadge>
          </div>
          <div className="mt-4 space-y-3">
            {alerts.map((a) => (
              <div key={a.judul} className={cn(
                "rounded-lg border p-3 flex items-start gap-3",
                a.level === "danger" && "border-danger/20 bg-danger-light",
                a.level === "warning" && "border-warning/20 bg-warning-light",
                a.level === "info" && "border-primary/20 bg-primary-light",
              )}>
                <AlertCircle className={cn(
                  "h-4 w-4 mt-0.5 shrink-0",
                  a.level === "danger" && "text-danger",
                  a.level === "warning" && "text-warning",
                  a.level === "info" && "text-primary",
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy leading-snug">{a.judul}</p>
                  <button className="mt-1.5 text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5">
                    Lihat detail <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* B. Aktivitas */}
      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-navy">Aktivitas Follow-up Terbaru</h3>
            <p className="text-xs text-muted-foreground">Membantu pemantauan koordinasi cabang dan digital channel.</p>
          </div>
          <button className="text-xs font-medium text-primary hover:underline">Lihat semua</button>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {aktivitas.map((a, i) => (
            <li key={i} className="py-3 flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                {a.status === "Selesai" ? <CheckCircle2 className="h-4 w-4 text-success" /> :
                 a.status === "Eskalasi" ? <AlertCircle className="h-4 w-4 text-danger" /> :
                 <Loader2 className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy font-medium leading-snug">{a.judul}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{a.waktu}</span>
                  <span>·</span>
                  <StatusBadge tone="blue">{a.channel}</StatusBadge>
                  <StatusBadge tone={statusToTone(a.status)}>{a.status}</StatusBadge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
