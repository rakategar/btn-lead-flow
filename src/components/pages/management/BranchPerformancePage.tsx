import { useState } from "react";
import { X, Building2, Users, BookOpen } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { branches, picActivities, type Branch } from "@/lib/dummy-data";
import { PageHero, PanelHeader, ProgressBar, statusToneFor, fmtRp } from "./_shared";

type SortKey = "performanceScore" | "closingMTD" | "pipelineValue" | "gap";

export function BranchPerformancePage() {
  const [sort, setSort] = useState<SortKey>("performanceScore");
  const [open, setOpen] = useState<Branch | null>(null);

  const sorted = [...branches].sort((a, b) => (b[sort] as number) - (a[sort] as number));

  return (
    <div className="space-y-5">
      <PageHero title="Branch Performance" subtitle="Perbandingan performa, drill-down, dan heatmap cabang nasional." />

      {/* Heatmap */}
      <section className="panel p-5">
        <PanelHeader title="Heatmap Performance" caption="Warna mengindikasikan performance score: hijau sehat, kuning watchlist, merah at risk." icon={Building2} />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {branches.map((b) => {
            const bg = b.status === "Healthy" ? "bg-primary/20 border-primary/30" : b.status === "Watchlist" ? "bg-primary/20 border-primary/30" : "bg-danger/20 border-danger/30";
            return (
              <button key={b.name} onClick={() => setOpen(b)} className={cn("rounded-lg border p-3 text-left hover:shadow-soft transition-shadow", bg)}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{b.region}</div>
                <div className="text-sm font-bold text-navy truncate">{b.name}</div>
                <div className="mt-1 text-2xl font-extrabold text-navy">{b.performanceScore}</div>
                <div className="text-[10px] text-muted-foreground">score</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Table */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-navy">Tabel Perbandingan Cabang</h3>
            <p className="text-xs text-muted-foreground">Klik baris untuk lihat detail cabang.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-8 px-2 rounded-md border border-input bg-background">
              <option value="performanceScore">Performance Score</option>
              <option value="closingMTD">Closing MTD</option>
              <option value="pipelineValue">Pipeline Value</option>
              <option value="gap">Gap</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Cabang</th>
                <th className="text-left px-3 py-3">Leader</th>
                <th className="text-center px-3 py-3">Sales</th>
                <th className="text-center px-3 py-3">Activity</th>
                <th className="text-right px-3 py-3">Pipeline</th>
                <th className="text-right px-3 py-3">Closing MTD</th>
                <th className="text-right px-3 py-3">Target</th>
                <th className="text-right px-3 py-3">Gap</th>
                <th className="text-right pr-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((b) => (
                <tr key={b.name} className="hover:bg-muted/30 cursor-pointer" onClick={() => setOpen(b)}>
                  <td className="px-5 py-3 font-medium text-navy">{b.name}</td>
                  <td className="px-3 py-3 text-navy">{b.leader}</td>
                  <td className="px-3 py-3 text-center">{b.salesCount}</td>
                  <td className="px-3 py-3 text-center">{b.activityScore}</td>
                  <td className="px-3 py-3 text-right text-navy">{fmtRp(b.pipelineValue)}</td>
                  <td className="px-3 py-3 text-right text-navy">{fmtRp(b.closingMTD)}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground">{fmtRp(b.target)}</td>
                  <td className={cn("px-3 py-3 text-right font-semibold", b.gap < -30 ? "text-danger" : "text-primary")}>{b.gap}%</td>
                  <td className="pr-5 py-3 text-right"><StatusBadge tone={statusToneFor(b.status)}>{b.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer */}
      {open && <BranchDrawer branch={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function BranchDrawer({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const acts = picActivities.filter((p) => p.leader === branch.leader);
  const pct = Math.round((branch.closingMTD / branch.target) * 100);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-lg bg-card shadow-xl border-l border-border overflow-y-auto animate-fade-in">
        <div className="p-5 border-b border-border flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{branch.region} · {branch.area}</div>
            <h3 className="text-lg font-bold text-navy">{branch.name}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <StatusBadge tone={statusToneFor(branch.status)}>{branch.status}</StatusBadge>
              <StatusBadge tone="navy">Leader {branch.leader}</StatusBadge>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid gap-3 grid-cols-2">
            <Stat label="Performance Score" value={branch.performanceScore} />
            <Stat label="Activity Score" value={branch.activityScore} />
            <Stat label="Pipeline" value={fmtRp(branch.pipelineValue)} />
            <Stat label="Closing MTD" value={fmtRp(branch.closingMTD)} />
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Closing vs Target</span>
              <span className="font-semibold text-navy">{pct}% · {fmtRp(branch.closingMTD)} / {fmtRp(branch.target)}</span>
            </div>
            <div className="mt-2"><ProgressBar pct={pct} tone={pct < 50 ? "danger" : "primary"} /></div>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-primary" /><h4 className="font-semibold text-navy text-sm">Aktivitas Tim</h4></div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr><th className="px-3 py-2 text-left">RM</th><th className="px-2 py-2 text-center">Pros</th><th className="px-2 py-2 text-center">FU</th><th className="px-2 py-2 text-center">Meet</th><th className="px-2 py-2 text-center">Close</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {acts.length === 0 && <tr><td colSpan={5} className="text-center py-3 text-muted-foreground">Belum ada data aktivitas tim untuk cabang ini.</td></tr>}
                  {acts.map((a) => (
                    <tr key={a.pic}><td className="px-3 py-2 font-medium text-navy">{a.pic}</td><td className="px-2 py-2 text-center">{a.prospecting}</td><td className="px-2 py-2 text-center">{a.followUp}</td><td className="px-2 py-2 text-center">{a.meeting}</td><td className="px-2 py-2 text-center">{a.closing}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2"><BookOpen className="h-4 w-4 text-primary" /><h4 className="font-semibold text-navy text-sm">Coaching Notes Terbaru</h4></div>
            <ul className="space-y-2 text-sm">
              <li className="rounded-lg border border-border p-2.5"><div className="text-[11px] text-muted-foreground">3 hari lalu</div>Fokus closing untuk RM junior — review objection bersama Leader.</li>
              <li className="rounded-lg border border-border p-2.5"><div className="text-[11px] text-muted-foreground">1 minggu lalu</div>Ritme follow-up perlu ditingkatkan, terutama FU2.</li>
            </ul>
          </section>

          <Button className="w-full bg-navy hover:bg-navy/90 text-navy-foreground">Kirim AI Remedial Plan ke Leader</Button>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-navy">{value}</div>
    </div>
  );
}
