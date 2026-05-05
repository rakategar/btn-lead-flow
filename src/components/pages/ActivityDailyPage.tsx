import { Phone, MessageSquare, Calendar, Sun, Briefcase, FileCheck2, CheckCircle2, BookOpen, Crown, UserRound } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { picActivities, dailyRhythm, leaders } from "@/lib/dummy-data";
import { useAuth } from "@/lib/auth";

export function ActivityDailyPage() {
  const { user } = useAuth();

  // Role-based scoping:
  // - Sales Leader: hanya RM dalam tim-nya
  // - Sales Team (RM): hanya dirinya sendiri
  const visiblePics = picActivities.filter((p) => {
    if (!user) return true;
    if (user.role === "leader") {
      const team = leaders.find((l) => l.name === user.name)?.rms ?? [];
      return team.includes(p.pic);
    }
    return p.pic === user.name;
  });

  const scopeLabel = user?.role === "leader"
    ? `Tim ${user.name} · ${visiblePics.length} RM`
    : user?.role === "rm"
      ? `Hanya data Anda — ${user.name}`
      : "Semua RM";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Prospecting Hari Ini" value="24" hint="Kontak baru ditambahkan" icon={Phone} tone="blue" />
        <KpiCard title="Follow-Up Hari Ini" value="31" hint="Eksekusi pipeline FU1–FU3" icon={MessageSquare} tone="orange" />
        <KpiCard title="Appointment Hari Ini" value="9" hint="Meeting & kunjungan" icon={Calendar} tone="green" />
      </div>

      {/* Sumber checklist — alur penurunan */}
      <section className="panel p-5 bg-gradient-to-br from-card to-primary-light/30 border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-navy">Asal Checklist Harian</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Checklist diturunkan dari kerangka <span className="font-semibold text-navy">A.C.T — Action Daily</span> + SOP Sales Discipline Primera Karya Sinergia.
            </p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-4 text-xs">
              <FlowStep n={1} title="Kerangka A.C.T" desc="Action · Control · Track menjadi pondasi ritme." />
              <FlowStep n={2} title="SOP Sales Discipline" desc="Standar perilaku harian sales." />
              <FlowStep n={3} title="Target Bulanan" desc="Diturunkan menjadi target harian per RM." />
              <FlowStep n={4} title="Daily Checklist" desc="Item konkret yang dieksekusi tiap hari." />
            </ol>
          </div>
        </div>
      </section>

      {/* Daily rhythm */}
      <section>
        <SectionHead title="Matriks Eksekusi Harian (Daily Rhythm)" caption="Sinkronisasi antara Sales Team dan Sales Leader." />
        <div className="grid gap-4 lg:grid-cols-3">
          <RhythmCol icon={Sun} title="Morning Briefing" sales="Hadir (07.30–08.30)" head="Memimpin, koordinasi & motivasi target." />
          <RhythmCol icon={Briefcase} title="Field Execution" sales="Min. 2 kunjungan, share WA 5 kontak baru." head="Coaching harian (WA/Telp), jaga koordinasi." />
          <RhythmCol icon={FileCheck2} title="Reporting & Review" sales="Update pipeline maks 17.00." head="Monitoring & rumuskan remedial (maks 18.00)." />
        </div>
      </section>

      {/* Checklist by role */}
      <section className="grid gap-4 md:grid-cols-2">
        <Checklist title="Sales Team" subtitle="Diturunkan dari SOP Sales Discipline & target harian RM." icon={UserRound} tone="blue" items={dailyRhythm.sales} />
        <Checklist title="Sales Leader" subtitle="Diturunkan dari pilar Control & Track pada kerangka A.C.T." icon={Crown} tone="navy" items={dailyRhythm.head} />
      </section>

      {/* PIC table */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-navy">Aktivitas Per RM Hari Ini</h3>
            <p className="text-xs text-muted-foreground">Membantu visibilitas konsistensi aktivitas harian per personel.</p>
          </div>
          <StatusBadge tone={user?.role === "rm" ? "blue" : "gold"}>{scopeLabel}</StatusBadge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Nama RM</th>
                <th className="text-left px-3 py-3">Leader</th>
                <th className="text-center px-3 py-3">Prospecting</th>
                <th className="text-center px-3 py-3">Follow-Up</th>
                <th className="text-center px-3 py-3">Meeting</th>
                <th className="text-center px-3 py-3">Closing</th>
                <th className="text-right pr-5 py-3">Status Kedisiplinan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visiblePics.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">Tidak ada data dalam scope akun ini.</td></tr>
              )}
              {visiblePics.map((p) => (
                <tr key={p.pic} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-navy">{p.pic}</td>
                  <td className="px-3 py-3 text-navy">{p.leader}</td>
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
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[hsl(var(--gold))]">Sales Leader</div>
          <div className="text-navy mt-0.5">{head}</div>
        </div>
      </div>
    </div>
  );
}

function Checklist({ title, subtitle, items, tone, icon: Icon }: { title: string; subtitle: string; items: string[]; tone: "blue" | "navy"; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="panel p-5">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone === "navy" ? "bg-navy text-gold" : "bg-primary-light text-primary"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-navy">{title}</h4>
          <p className="text-[11px] text-muted-foreground leading-snug">{subtitle}</p>
        </div>
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

function FlowStep({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="rounded-lg bg-card border border-border p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-gold">{n}</span>
        <span className="text-xs font-bold text-navy">{title}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{desc}</p>
    </li>
  );
}
