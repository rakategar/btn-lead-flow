import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { cabang } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

export function CabangPage() {
  const max = Math.max(...cabang.map((c) => c.sla));
  return (
    <div className="space-y-5">
      <div className="panel overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-navy">Performa Cabang</h3>
          <p className="text-xs text-muted-foreground">Membantu koordinasi cabang dan digital channel.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Cabang</th>
                <th className="px-4 py-3 text-right font-semibold">Lead Aktif</th>
                <th className="px-4 py-3 text-right font-semibold">Follow-up Hari Ini</th>
                <th className="px-4 py-3 text-right font-semibold">Case Terbuka</th>
                <th className="px-4 py-3 text-right font-semibold">SLA</th>
                <th className="px-4 py-3 text-right font-semibold">Backlog</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cabang.map((c) => (
                <tr key={c.nama} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-navy">{c.nama}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.lead}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.followUp}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.caseOpen}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-navy">{c.sla}%</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.backlog}</td>
                  <td className="px-4 py-3"><StatusBadge tone={statusToTone(c.status)}>{c.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="font-semibold text-navy">SLA by Cabang</h3>
        <p className="text-xs text-muted-foreground mb-4">Visualisasi tingkat ketepatan SLA per cabang.</p>
        <div className="space-y-3">
          {cabang.map((c) => {
            const w = (c.sla / 100) * 100;
            const color = c.sla >= 92 ? "bg-success" : c.sla >= 88 ? "bg-accent" : "bg-danger";
            return (
              <div key={c.nama}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-navy">{c.nama}</span>
                  <span className="tabular-nums font-semibold text-navy">{c.sla}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full", color)} style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border">
          Cabang dengan response time cepat cenderung memiliki konversi yang lebih baik.
        </p>
      </div>
    </div>
  );
}
