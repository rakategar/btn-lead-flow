import { useState } from "react";
import { History, Download, ShieldCheck, Database, Lock, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { cn } from "@/lib/utils";
import { auditLogs, exportLogs, securityOverview, dataQuality, branches } from "@/lib/dummy-data";
import { PageHero, ProgressBar } from "./_shared";

type Tab = "activity" | "export" | "security" | "quality";

export function AuditGovernancePage() {
  const [tab, setTab] = useState<Tab>("activity");

  return (
    <div className="space-y-5">
      <PageHero title="Audit & Governance" subtitle="Log aktivitas, export, keamanan, dan kualitas data." />

      <div className="flex flex-wrap items-center gap-2">
        <TabBtn active={tab === "activity"} onClick={() => setTab("activity")} icon={History}>Activity Log</TabBtn>
        <TabBtn active={tab === "export"}   onClick={() => setTab("export")}   icon={Download}>Export Log</TabBtn>
        <TabBtn active={tab === "security"} onClick={() => setTab("security")} icon={ShieldCheck}>Security</TabBtn>
        <TabBtn active={tab === "quality"}  onClick={() => setTab("quality")}  icon={Database}>Data Quality</TabBtn>
      </div>

      {tab === "activity" && <LogTable title="Activity Log" rows={auditLogs} />}
      {tab === "export"   && <LogTable title="Export Log"   rows={exportLogs} />}

      {tab === "security" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Login Sukses" value={securityOverview.loginSuccess} hint="30 hari terakhir" icon={ShieldCheck} tone="green" />
            <KpiCard title="Login Gagal" value={securityOverview.loginFail} hint="Pantau aktivitas mencurigakan" icon={AlertTriangle} tone="orange" />
            <KpiCard title="Sesi Aktif" value={securityOverview.activeSessions} hint="User online sekarang" icon={Lock} tone="blue" />
            <KpiCard title="Akun Idle >30 Hari" value={securityOverview.idleAccounts} hint="Pertimbangkan deaktivasi" icon={AlertTriangle} tone="navy" />
          </div>
          <section className="panel p-5">
            <h3 className="font-bold text-navy">Rekomendasi Keamanan</h3>
            <ul className="mt-3 space-y-2 text-sm text-navy">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />Aktifkan MFA untuk seluruh user role Management dan Sales Leader.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />Deaktivasi 4 akun idle yang tidak login &gt;30 hari.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />Audit izin akses cabang setelah rotasi struktur.</li>
            </ul>
          </section>
        </>
      )}

      {tab === "quality" && (
        <section className="panel overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-bold text-navy">Data Quality per Cabang</h3>
            <p className="text-xs text-muted-foreground">Persentase masalah data — semakin rendah semakin baik.</p>
          </div>
          <div className="p-5 space-y-3">
            {dataQuality.map((d) => (
              <div key={d.branch} className="rounded-lg border border-border p-3">
                <div className="text-sm font-semibold text-navy">{d.branch}</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Metric label="Field kosong" pct={d.emptyFields} />
                  <Metric label="Data duplikat" pct={d.duplicates * 5} display={`${d.duplicates}`} />
                  <Metric label="Lead tanpa catatan" pct={d.leadsNoNote * 3} display={`${d.leadsNoNote}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, pct, display }: { label: string; pct: number; display?: string }) {
  const safe = Math.min(100, pct);
  const tone = safe < 15 ? "success" : safe < 35 ? "gold" : "danger";
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-navy">{display ?? `${safe}%`}</span>
      </div>
      <div className="mt-1.5"><ProgressBar pct={safe} tone={tone as any} /></div>
    </div>
  );
}

function LogTable({ title, rows }: { title: string; rows: { ts: string; user: string; action: string; target: string }[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-bold text-navy">{title}</h3>
        <p className="text-xs text-muted-foreground">{rows.length} entri terbaru.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-5 py-3">Waktu</th><th className="text-left px-3 py-3">User</th><th className="text-left px-3 py-3">Aksi</th><th className="text-left pr-5 py-3">Target / Data</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="px-5 py-3 text-muted-foreground">{r.ts}</td>
                <td className="px-3 py-3 font-medium text-navy">{r.user}</td>
                <td className="px-3 py-3 text-navy">{r.action}</td>
                <td className="pr-5 py-3 text-muted-foreground">{r.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TabBtn({ active, onClick, icon: Icon, children }: { active?: boolean; onClick?: () => void; icon: any; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors", active ? "bg-navy text-navy-foreground border-navy" : "bg-card text-muted-foreground border-border hover:border-navy/40")}>
      <Icon className="h-3.5 w-3.5" />{children}
    </button>
  );
}
