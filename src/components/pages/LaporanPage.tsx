import { cn } from "@/lib/utils";
import { campaigns, cabang } from "@/lib/dummy-data";

const channelData = [
  { name: "balé Properti", value: 420, color: "bg-primary" },
  { name: "Cabang", value: 280, color: "bg-navy" },
  { name: "Call Center", value: 180, color: "bg-accent" },
  { name: "Developer", value: 260, color: "bg-success" },
  { name: "Campaign Digital", value: 108, color: "bg-info" },
];

const slaMonthly = [
  { m: "Nov", v: 88 }, { m: "Des", v: 89 }, { m: "Jan", v: 90 },
  { m: "Feb", v: 91 }, { m: "Mar", v: 90 }, { m: "Apr", v: 92 },
];

const insights = [
  "Channel balé Properti menyumbang lead digital tertinggi.",
  "Cabang dengan response time cepat punya conversion lebih baik.",
  "Lead developer memiliki potensi tinggi jika assignment lebih cepat.",
  "SLA follow-up menjadi indikator penting untuk menjaga pengalaman nasabah.",
];

export function LaporanPage() {
  const totalChannel = channelData.reduce((s, x) => s + x.value, 0);
  const maxSla = Math.max(...slaMonthly.map((s) => s.v));

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <h3 className="font-semibold text-navy">Lead per Channel</h3>
          <p className="text-xs text-muted-foreground">Distribusi lead 30 hari terakhir.</p>
          <div className="mt-4 space-y-2.5">
            {channelData.map((c) => {
              const pct = Math.round((c.value / totalChannel) * 100);
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-navy">{c.name}</span>
                    <span className="text-muted-foreground tabular-nums">{c.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full", c.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="font-semibold text-navy">SLA Bulanan</h3>
          <p className="text-xs text-muted-foreground">Tren SLA tepat waktu 6 bulan terakhir.</p>
          <div className="mt-6 flex items-end gap-3 h-44">
            {slaMonthly.map((s) => {
              const h = (s.v / 100) * 100;
              const active = s.v === maxSla;
              return (
                <div key={s.m} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold text-navy tabular-nums">{s.v}%</div>
                  <div className="w-full bg-muted rounded-t-md flex items-end" style={{ height: "100%" }}>
                    <div
                      className={cn("w-full rounded-t-md transition-all", active ? "bg-accent" : "bg-primary")}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{s.m}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="font-semibold text-navy">Status Pipeline (Konversi per Tahap)</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { l: "Lead Masuk", v: 100 },
            { l: "Terhubungi", v: 66 },
            { l: "Konsultasi", v: 41 },
            { l: "Dokumen", v: 22 },
            { l: "Pengajuan", v: 14 },
            { l: "Akad", v: 7 },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-border p-3 text-center">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="mt-1 text-2xl font-bold text-navy tabular-nums">{s.v}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="font-semibold text-navy">Ringkasan Insight</h3>
        <ul className="mt-3 space-y-2">
          {insights.map((t, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-navy">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
