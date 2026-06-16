import { Target, BarChart3, Trophy } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { productKpis, officerProductivity } from "@/lib/dummy-data";
import { PageHero, PanelHeader, ProgressBar, fmtRp } from "./_shared";

export function KpiTrackerPage() {
  const totalMtd = productKpis.reduce((s, p) => s + p.mtd, 0);
  const totalPrev = productKpis.reduce((s, p) => s + p.prevMonth, 0);
  const totalLY = productKpis.reduce((s, p) => s + p.lastYear, 0);
  const maxBar = Math.max(totalMtd, totalPrev, totalLY);

  return (
    <div className="space-y-5">
      <PageHero title="KPI & Target Tracker" subtitle="Pantau pencapaian per produk dan produktivitas officer." />

      {/* Product cards */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {productKpis.map((p) => (
            <div key={p.name} className="kpi-card">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white"><Target className="h-4 w-4" /></div>
                <StatusBadge tone={p.pct < 70 ? "red" : "blue"}>{p.pct}%</StatusBadge>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{p.name}</div>
              <div className="mt-1 text-2xl font-extrabold text-navy">{fmtRp(p.actual)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Target {fmtRp(p.target)} · gap {fmtRp(Math.abs(p.gap))}</div>
              <div className="mt-3"><ProgressBar pct={p.pct} tone={p.pct < 70 ? "danger" : "primary"} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="panel p-5">
        <PanelHeader title="MTD vs Bulan Lalu vs YoY" caption="Perbandingan total revenue lintas periode (juta Rupiah)." icon={BarChart3} />
        <div className="mt-5 space-y-3">
          {[
            { label: "MTD",          value: totalMtd,  tone: "primary" as const },
            { label: "Bulan Lalu",   value: totalPrev, tone: "blue" as const },
            { label: "Tahun Lalu",   value: totalLY,   tone: "blue" as const },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-[100px_1fr_120px] items-center gap-3">
              <span className="text-sm font-semibold text-navy">{row.label}</span>
              <ProgressBar pct={(row.value / maxBar) * 100} tone={row.tone} />
              <span className="text-right text-sm font-bold text-navy">{fmtRp(row.value)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Officer productivity */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white"><Trophy className="h-4 w-4" /></div>
          <div>
            <h3 className="font-bold text-navy">Produktivitas Officer</h3>
            <p className="text-xs text-muted-foreground">Aktivitas dan revenue per officer dengan ranking.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Rank</th>
                <th className="text-left px-3 py-3">Nama</th>
                <th className="text-left px-3 py-3">Cabang</th>
                <th className="text-center px-3 py-3">Contact</th>
                <th className="text-center px-3 py-3">Meeting</th>
                <th className="text-center px-3 py-3">Closing</th>
                <th className="text-right pr-5 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {officerProductivity.map((o, i) => (
                <tr key={o.name} className="hover:bg-muted/30">
                  <td className="px-5 py-3"><span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold", i < 3 ? "bg-navy text-white" : "bg-muted text-muted-foreground")}>{i + 1}</span></td>
                  <td className="px-3 py-3 font-medium text-navy">{o.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{o.branch}</td>
                  <td className="px-3 py-3 text-center">{o.contact}</td>
                  <td className="px-3 py-3 text-center">{o.meeting}</td>
                  <td className="px-3 py-3 text-center">{o.closing}</td>
                  <td className="pr-5 py-3 text-right font-semibold text-navy">{fmtRp(o.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
