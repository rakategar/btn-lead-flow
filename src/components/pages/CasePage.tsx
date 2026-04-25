import { AlertTriangle, ShieldCheck, Clock, AlertOctagon } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { auditTrail, cases } from "@/lib/dummy-data";

const slaRules = [
  "Lead baru idealnya dihubungi maksimal 24 jam",
  "Case prioritas tinggi dieskalasi sebelum 4 jam terakhir",
  "Semua perubahan status tercatat dalam audit trail",
  "Supervisor melihat backlog cabang dan PIC",
];

export function CasePage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Case Terbuka" value="47" hint="Perlu tindak lanjut CS / cabang" icon={AlertTriangle} tone="orange" />
        <KpiCard title="SLA Aman" value="92%" hint="Sesuai target internal" icon={ShieldCheck} tone="green" />
        <KpiCard title="Mendekati SLA" value="7" hint="Perlu prioritas hari ini" icon={Clock} tone="orange" />
        <KpiCard title="Lewat SLA" value="3" hint="Wajib eskalasi supervisor" icon={AlertOctagon} tone="navy" />
      </div>

      <div className="panel overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-navy">Daftar Case Aktif</h3>
            <p className="text-xs text-muted-foreground">Membantu pengendalian SLA layanan dan koordinasi tindak lanjut.</p>
          </div>
          <StatusBadge tone="orange">Demo</StatusBadge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">ID Case</th>
                <th className="px-4 py-3 text-left font-semibold">Nasabah</th>
                <th className="px-4 py-3 text-left font-semibold">Jenis Case</th>
                <th className="px-4 py-3 text-left font-semibold">Channel</th>
                <th className="px-4 py-3 text-left font-semibold">PIC</th>
                <th className="px-4 py-3 text-left font-semibold">Prioritas</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Sisa SLA</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-navy">{c.nasabah}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.jenis}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.channel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.pic}</td>
                  <td className="px-4 py-3"><StatusBadge tone={statusToTone(c.prioritas)}>{c.prioritas}</StatusBadge></td>
                  <td className="px-4 py-3"><StatusBadge tone={statusToTone(c.status)}>{c.status}</StatusBadge></td>
                  <td className="px-4 py-3 font-medium text-navy">{c.sla}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-primary text-xs font-medium hover:underline">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <h3 className="font-semibold text-navy">SLA Rules — Demo</h3>
          <p className="text-xs text-muted-foreground">Aturan operasional yang menjadi acuan demo dashboard.</p>
          <ul className="mt-4 space-y-2.5">
            {slaRules.map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-navy">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <h3 className="font-semibold text-navy">Audit Trail — Demo</h3>
          <p className="text-xs text-muted-foreground">Riwayat aktivitas otomatis untuk satu lead.</p>
          <ol className="mt-4 relative border-l border-border pl-5 space-y-4">
            {auditTrail.map((a, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-accent border-2 border-card" />
                <div className="text-xs font-mono font-medium text-muted-foreground">{a.waktu}</div>
                <div className="text-sm text-navy">{a.aksi}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
