import { Clock, MessageCircle, Megaphone, CheckCircle2, AlertCircle, Hourglass, XCircle } from "lucide-react";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { followUpDue } from "@/lib/dummy-data";

const fuStages = [
  { stage: "FU1", time: "H+1 s.d H+3", desc: "Reminder dan klarifikasi awal setelah pertemuan.", icon: MessageCircle, tone: "blue" as const },
  { stage: "FU2", time: "H+5 s.d H+7", desc: "Tindak lanjut intensif, objection handling, dan tambahan informasi.", icon: Hourglass, tone: "orange" as const },
  { stage: "FU3", time: "H+10 s.d H+14", desc: "Dorongan final, urgensi penawaran, dan keputusan akhir.", icon: Megaphone, tone: "red" as const },
];

const resolutions = [
  { name: "Close", icon: CheckCircle2, tone: "green" as const, desc: "Prospek sukses dikonversi menjadi nasabah / transaksi selesai." },
  { name: "In Progress", icon: Clock, tone: "blue" as const, desc: "Masih aktif dalam proses Contact / Meet / Prospect." },
  { name: "Follow Up", icon: AlertCircle, tone: "orange" as const, desc: "Masih menunggu waktu, approval, atau tindak lanjut spesifik." },
  { name: "Not Eligible", icon: XCircle, tone: "gray" as const, desc: "Tidak memenuhi syarat / belum sesuai kebutuhan." },
];

export function FollowUpPage() {
  return (
    <div className="space-y-5">
      {/* A — Eskalasi */}
      <section>
        <Head title="Skema Eskalasi Follow-Up" caption="Tahapan FU1 → FU3 untuk menjaga ritme konversi." />
        <div className="grid gap-4 md:grid-cols-3">
          {fuStages.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.stage} className="panel p-5 relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-1 w-full ${f.tone === "blue" ? "bg-primary" : f.tone === "orange" ? "bg-accent" : "bg-danger"}`} />
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    f.tone === "blue" ? "bg-primary-light text-primary" :
                    f.tone === "orange" ? "bg-accent-light text-accent" :
                    "bg-danger-light text-danger"
                  }`}><Icon className="h-5 w-5" /></div>
                  <div>
                    <div className="text-lg font-extrabold text-navy">{f.stage}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{f.time}</div>
                  </div>
                  <span className="ml-auto text-3xl font-extrabold text-muted-foreground/30">0{i + 1}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* B — Status resolusi */}
      <section>
        <Head title="Klasifikasi Status Resolusi Pipeline" caption="Empat status akhir untuk menjaga kebersihan pipeline." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resolutions.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.name} className="panel p-5">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${
                    r.tone === "green" ? "text-success" :
                    r.tone === "blue" ? "text-primary" :
                    r.tone === "orange" ? "text-accent" :
                    "text-muted-foreground"
                  }`} />
                  <div className="font-bold text-navy">{r.name}</div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* C — Due list */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Follow-Up Due</h3>
          <p className="text-xs text-muted-foreground">Daftar follow-up terjadwal yang memerlukan tindakan.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Nama Lead</th>
                <th className="text-left px-3 py-3">Stage</th>
                <th className="text-left px-3 py-3">PIC</th>
                <th className="text-left px-3 py-3">Tahap FU</th>
                <th className="text-left px-3 py-3">Jadwal</th>
                <th className="text-right pr-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {followUpDue.map((l) => (
                <tr key={l.nama} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-navy">{l.nama}</td>
                  <td className="px-3 py-3"><StatusBadge tone="navy">{l.stage}</StatusBadge></td>
                  <td className="px-3 py-3 text-navy">{l.pic}</td>
                  <td className="px-3 py-3"><StatusBadge tone={l.fu === "FU1" ? "blue" : l.fu === "FU2" ? "orange" : "red"}>{l.fu}</StatusBadge></td>
                  <td className="px-3 py-3 text-navy">{l.jadwal}</td>
                  <td className="pr-5 py-3 text-right"><StatusBadge tone={statusToTone(l.catatan === "Prioritas tinggi" ? "High" : l.catatan === "Evaluasi ulang" ? "Cold" : "Warm")}>{l.catatan}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Head({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-bold text-navy">{title}</h3>
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}
