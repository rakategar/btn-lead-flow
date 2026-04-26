import { CalendarDays, CalendarClock, Users, Trophy, BadgeDollarSign, Heart, TrendingUp, Crown, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { weeklyRhythm, monthlyRhythm, resultArea } from "@/lib/dummy-data";

const alignment = [
  { label: "Sales Team Status", value: "On Track", tone: "green" as const },
  { label: "Head of Sales Review", value: "Mingguan terjadwal", tone: "blue" as const },
  { label: "Gap Alignment", value: "2 area perlu sinkronisasi", tone: "orange" as const },
  { label: "Next Coaching Focus", value: "Closing & objection handling", tone: "gold" as const },
];

const resultIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Revenue: BadgeDollarSign,
  Engagement: Heart,
  "Sales Growth": TrendingUp,
  Leadership: Crown,
};

export function KpiReviewPage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <RhythmCard title="Weekly Rhythm" caption="Eksekusi mingguan untuk menutup gap aktivitas." icon={CalendarDays} items={weeklyRhythm} />
        <RhythmCard title="Monthly Rhythm" caption="Evaluasi bulanan dan rencana remedial." icon={CalendarClock} items={monthlyRhythm} />
      </div>

      {/* Alignment */}
      <section>
        <Head title="Alignment Management" caption="Sinkronisasi antara Sales Team dan Head of Sales." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {alignment.map((a) => (
            <div key={a.label} className="panel p-4">
              <div className="text-xs text-muted-foreground">{a.label}</div>
              <div className="mt-2"><StatusBadge tone={a.tone}>{a.value}</StatusBadge></div>
            </div>
          ))}
        </div>
      </section>

      {/* Result */}
      <section>
        <Head title="Result Area" caption="Empat area hasil yang dipantau dari kerangka A.C.T." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resultArea.map((r) => {
            const Icon = resultIcons[r.name] ?? Trophy;
            return (
              <div key={r.name} className="panel p-5 bg-gradient-to-br from-card to-gold-light/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-gold"><Icon className="h-5 w-5" /></div>
                  <div className="text-sm font-semibold text-navy">{r.name}</div>
                </div>
                <div className="mt-3 text-2xl font-extrabold text-navy">{r.value}</div>
                <div className="text-xs text-muted-foreground">{r.caption}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="panel p-4 text-xs text-muted-foreground border-l-4 border-l-[hsl(var(--gold))]">
        <span className="font-semibold text-navy">Catatan:</span> Nilai pada halaman ini adalah dummy untuk kebutuhan presentasi konsep.
        Kerangka A.C.T menjaga konsistensi dari aktivitas harian hingga area hasil.
      </div>
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

function RhythmCard({ title, caption, icon: Icon, items }: { title: string; caption: string; icon: React.ComponentType<{ className?: string }>; items: string[] }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary"><Icon className="h-5 w-5" /></div>
        <div>
          <h4 className="font-bold text-navy">{title}</h4>
          <p className="text-xs text-muted-foreground">{caption}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <span className="text-navy">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
