import { useState } from "react";
import { Activity, Filter, TrendingDown, ListChecks } from "lucide-react";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { branches, funnelConversion, remedialDashboard, type Lead, type PipelineStage } from "@/lib/dummy-data";
import { PanelHeader, PageHero, ProgressBar, fmtRp } from "./_shared";

const stages: PipelineStage[] = ["Contact", "Meet", "Prospect", "Close"];

interface Props { leads: Lead[] }

export function MgmtCommandCenterPage({ leads }: Props) {
  const [branch, setBranch] = useState("Semua");
  const [area, setArea] = useState("Semua");
  const [produk, setProduk] = useState("Semua");
  const [temp, setTemp] = useState<"Semua" | "Hot" | "Warm" | "Cold">("Semua");
  const [periode, setPeriode] = useState("MTD");

  const areas = Array.from(new Set(branches.map((b) => b.area)));
  const produkList = Array.from(new Set(leads.map((l) => l.produk)));
  const tempMap: Record<string, "Hot" | "Warm" | "Cold"> = { High: "Hot", Medium: "Warm", Low: "Cold" };

  const filtered = leads.filter((l) =>
    (produk === "Semua" || l.produk === produk) &&
    (temp === "Semua" || tempMap[l.priority] === temp)
  );

  // Pipeline value per stage (estimasi: leads × Rp 200jt + value cabang proporsional)
  const valueFor = (stage: PipelineStage) => {
    const items = filtered.filter((l) => l.stage === stage);
    return { count: items.length, value: items.length * 250 + (stage === "Close" ? 800 : stage === "Prospect" ? 1200 : stage === "Meet" ? 600 : 400) };
  };

  return (
    <div className="space-y-5">
      <PageHero title="A.C.T Command Center — Nasional" subtitle="Pipeline lintas cabang, funnel conversion, dan remedial dashboard." />

      {/* Filter bar */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <SelectField label="Cabang" value={branch} onChange={setBranch} options={["Semua", ...branches.map((b) => b.name)]} />
          <SelectField label="Area"   value={area}   onChange={setArea}   options={["Semua", ...areas]} />
          <SelectField label="Produk" value={produk} onChange={setProduk} options={["Semua", ...produkList]} />
          <SelectField label="Temperature" value={temp} onChange={(v) => setTemp(v as typeof temp)} options={["Semua", "Hot", "Warm", "Cold"]} />
          <SelectField label="Periode" value={periode} onChange={setPeriode} options={["Hari ini", "WTD", "MTD", "QTD", "YTD"]} />
        </div>
      </div>

      {/* Pipeline Board */}
      <section className="panel p-5">
        <PanelHeader title="Pipeline Board" caption="Jumlah lead dan total value per tahap (semua cabang)." icon={Activity} />
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {stages.map((s, i) => {
            const v = valueFor(s);
            return (
              <div key={s} className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-navy">{s}</div>
                  <StatusBadge tone="gold">{v.count} lead</StatusBadge>
                </div>
                <div className="text-2xl font-extrabold text-navy">{fmtRp(v.value)}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Total value</div>
                <div className={cn("mt-3 h-1.5 rounded-full", i === 3 ? "bg-success" : i >= 2 ? "bg-[hsl(var(--gold))]" : "bg-primary")} style={{ width: `${100 - i * 18}%` }} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Funnel */}
      <section className="panel p-5">
        <PanelHeader title="Funnel Conversion Rate" caption="Persentase tiap tahap vs benchmark." icon={TrendingDown} />
        <div className="mt-4 space-y-3">
          {funnelConversion.map((f) => {
            const onTrack = f.pct >= f.benchmark;
            return (
              <div key={f.stage} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-sm font-semibold text-navy">{f.stage}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className={cn("font-bold", onTrack ? "text-success" : "text-danger")}>{f.pct}%</span> · benchmark {f.benchmark}%
                  </div>
                </div>
                <ProgressBar pct={f.pct} tone={onTrack ? "success" : "danger"} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Remedial table */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold"><ListChecks className="h-4 w-4" /></div>
          <div>
            <h3 className="font-bold text-navy">Remedial Dashboard</h3>
            <p className="text-xs text-muted-foreground">Cabang dengan gap target dan rencana tindak lanjutnya.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Cabang</th>
                <th className="text-left px-3 py-3">Gap</th>
                <th className="text-left px-3 py-3">Owner</th>
                <th className="text-left px-3 py-3">Action Plan</th>
                <th className="text-left px-3 py-3">Deadline</th>
                <th className="text-right pr-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {remedialDashboard.map((r) => (
                <tr key={r.branch} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-navy">{r.branch}</td>
                  <td className="px-3 py-3 text-danger font-semibold">{r.gap}</td>
                  <td className="px-3 py-3 text-navy">{r.owner}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.action}</td>
                  <td className="px-3 py-3 text-navy">{r.deadline}</td>
                  <td className="pr-5 py-3 text-right"><StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-9 px-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
