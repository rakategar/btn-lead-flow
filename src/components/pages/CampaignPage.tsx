import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { campaigns } from "@/lib/dummy-data";

export function CampaignPage() {
  return (
    <div className="space-y-5">
      <div className="panel overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-navy">Kinerja Campaign</h3>
          <p className="text-xs text-muted-foreground">Membantu evaluasi efektivitas channel akuisisi.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Nama Campaign</th>
                <th className="px-4 py-3 text-left font-semibold">Channel</th>
                <th className="px-4 py-3 text-right font-semibold">Lead Masuk</th>
                <th className="px-4 py-3 text-right font-semibold">Qualified</th>
                <th className="px-4 py-3 text-right font-semibold">Konversi</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((c) => (
                <tr key={c.nama} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-navy">{c.nama}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.channel}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.lead}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.qualified}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-navy">{c.konversi}%</td>
                  <td className="px-4 py-3"><StatusBadge tone={statusToTone(c.status)}>{c.status}</StatusBadge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.insight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
