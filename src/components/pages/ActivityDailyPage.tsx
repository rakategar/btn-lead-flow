import { Phone, MessageSquare, Calendar, Sun, Briefcase, FileCheck2, CheckCircle2 } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { picActivities, dailyRhythm } from "@/lib/dummy-data";

export function ActivityDailyPage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Prospecting Hari Ini" value="24" hint="Kontak baru ditambahkan" icon={Phone} tone="blue" />
        <KpiCard title="Follow-Up Hari Ini" value="31" hint="Eksekusi pipeline FU1–FU3" icon={MessageSquare} tone="orange" />
        <KpiCard title="Appointment Hari Ini" value="9" hint="Meeting & kunjungan" icon={Calendar} tone="green" />
      </div>

      {/* Daily rhythm */}
      <section>
        <SectionHead title="Matriks Eksekusi Harian (Daily Rhythm)" caption="Sinkronisasi antara Sales Team dan Head of Sales." />
        <div className="grid gap-4 lg:grid-cols-3">
          <RhythmCol icon={Sun} title="Morning Briefing" sales="Hadir (07.30–08.30)" head="Memimpin, koordinasi & motivasi target." />
          <RhythmCol icon={Briefcase} title="Field Execution" sales="Min. 2 kunjungan, share WA 5 kontak baru." head="Coaching harian (WA/Telp), jaga koordinasi." />
          <RhythmCol icon={FileCheck2} title="Reporting & Review" sales="Update pipeline maks 17.00." head="Monitoring & rumuskan remedial (maks 18.00)." />
        </div>
      </section>

      {/* Checklist by role */}
      <section className="grid gap-4 md:grid-cols-2">
        <Checklist title="Sales Team" tone="blue" items={dailyRhythm.sales} />
        <Checklist title="Head of Sales" tone="navy" items={dailyRhythm.head} />
      </section>

      {/* PIC table */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Aktivitas Per PIC Hari Ini</h3>
          <p className="text-xs text-muted-foreground">Membantu visibilitas konsistensi aktivitas harian per personel.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Nama PIC</th>
                <th className="text-center px-3 py-3">Prospecting</th>
                <th className="text-center px-3 py-3">Follow-Up</th>
                <th className="text-center px-3 py-3">Meeting</th>
                <th className="text-center px-3 py-3">Closing</th>
                <th className="text-right pr-5 py-3">Status Kedisiplinan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {picActivities.map((p) => (
                <tr key={p.pic} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-navy">{p.pic}</td>
                  <td className="px-3 py-3 text-center text-navy">{p.prospecting}</td>
                  <td className="px-3 py-3 text-center text-navy">{p.followUp}</td>
                  <td className="px-3 py-3 text-center text-navy">{p.meeting}</td>
                  <td className="px-3 py-3 text-center text-navy">{p.closing}</td>
                  <td className="pr-5 py-3 text-right"><StatusBadge tone={statusToTone(p.disiplin)}>{p.disiplin}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-bold text-navy">{title}</h3>
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

function RhythmCol({ icon: Icon, title, sales, head }: { icon: React.ComponentType<{ className?: string }>; title: string; sales: string; head: string }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-light text-[hsl(var(--gold))]"><Icon className="h-4 w-4" /></div>
        <h4 className="font-bold text-navy">{title}</h4>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-primary">Sales Team</div>
          <div className="text-navy mt-0.5">{sales}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[hsl(var(--gold))]">Head of Sales</div>
          <div className="text-navy mt-0.5">{head}</div>
        </div>
      </div>
    </div>
  );
}

function Checklist({ title, items, tone }: { title: string; items: string[]; tone: "blue" | "navy" }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${tone === "navy" ? "bg-navy" : "bg-primary"}`} />
        <h4 className="font-bold text-navy">{title}</h4>
      </div>
      <ul className="mt-3 space-y-2 text-sm">
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
