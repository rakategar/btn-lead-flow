import { useMemo, useState } from "react";
import { Search, Plus, X, ChevronRight, CheckCircle2, AlertTriangle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import type { Lead, LeadStatus } from "@/lib/dummy-data";
import { customerInteraksi } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface Props {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  onAddLead: () => void;
  globalSearch: string;
}

const statusFilters: ("Semua" | LeadStatus)[] = ["Semua", "Baru", "Terhubungi", "Follow-up", "Konsultasi", "Pengajuan", "Lost"];
const channelFilters = ["Semua", "balé Properti", "Cabang", "Call Center", "Developer", "Campaign"];

export function LeadPage({ leads, setLeads, onAddLead, globalSearch }: Props) {
  const [statusF, setStatusF] = useState<string>("Semua");
  const [channelF, setChannelF] = useState<string>("Semua");
  const [localSearch, setLocalSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const q = (globalSearch || localSearch).toLowerCase();
    return leads.filter((l) =>
      (statusF === "Semua" || l.status === statusF) &&
      (channelF === "Semua" || l.channel === channelF) &&
      (q === "" || l.nama.toLowerCase().includes(q) || l.id.toLowerCase().includes(q) || l.cabang.toLowerCase().includes(q))
    );
  }, [leads, statusF, channelF, localSearch, globalSearch]);

  const updateLead = (id: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setSelected((s) => (s && s.id === id ? { ...s, ...patch } : s));
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="panel p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusF(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                statusF === s ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/50"
              )}
            >{s}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Channel:</span>
          {channelFilters.map((s) => (
            <button
              key={s}
              onClick={() => setChannelF(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                channelF === s ? "bg-navy text-navy-foreground border-navy" : "bg-background text-muted-foreground border-border hover:border-navy/50"
              )}
            >{s}</button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between pt-2 border-t border-border">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari berdasarkan nama atau ID lead"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <Button onClick={onAddLead} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-1.5" /> Tambah Lead Dummy
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">ID Lead</th>
                <th className="px-4 py-3 text-left font-semibold">Nama Prospek</th>
                <th className="px-4 py-3 text-left font-semibold">Channel</th>
                <th className="px-4 py-3 text-left font-semibold">Minat Produk</th>
                <th className="px-4 py-3 text-left font-semibold">Cabang</th>
                <th className="px-4 py-3 text-left font-semibold">PIC</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">SLA</th>
                <th className="px-4 py-3 text-left font-semibold">Follow-up</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Tidak ada lead yang cocok dengan filter saat ini.
                </td></tr>
              )}
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.id}</td>
                  <td className="px-4 py-3 font-medium text-navy">{l.nama}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.channel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.produk}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.cabang}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.pic}</td>
                  <td className="px-4 py-3"><StatusBadge tone={statusToTone(l.status)}>{l.status}</StatusBadge></td>
                  <td className="px-4 py-3"><StatusBadge tone={statusToTone(l.sla)}>{l.sla}</StatusBadge></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{l.followUp}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(l)} className="text-primary text-xs font-medium hover:underline inline-flex items-center gap-0.5">
                      Lihat <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
          <span>Menampilkan {filtered.length} dari {leads.length} lead</span>
          <span>Data dummy untuk kebutuhan demo</span>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-navy/30 animate-fade-in" onClick={() => setSelected(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-card border-b border-border p-5 flex items-start justify-between">
              <div>
                <div className="text-[11px] font-mono text-muted-foreground">{selected.id}</div>
                <h3 className="text-lg font-bold text-navy mt-0.5">{selected.nama}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <StatusBadge tone={statusToTone(selected.status)}>{selected.status}</StatusBadge>
                  <StatusBadge tone={statusToTone(selected.sla)}>SLA {selected.sla}</StatusBadge>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Informasi Lead</h4>
                <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div><dt className="text-xs text-muted-foreground">Channel sumber</dt><dd className="font-medium text-navy">{selected.channel}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Minat produk</dt><dd className="font-medium text-navy">{selected.produk}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Cabang tujuan</dt><dd className="font-medium text-navy">{selected.cabang}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">PIC officer</dt><dd className="font-medium text-navy">{selected.pic}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Kota</dt><dd className="font-medium text-navy">{selected.kota}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Follow-up terakhir</dt><dd className="font-medium text-navy">{selected.followUp}</dd></div>
                </dl>
              </section>

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Riwayat Interaksi</h4>
                <ol className="space-y-2.5">
                  {customerInteraksi.map((it, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <div className="flex-1">
                        <div className="text-navy">{it.aksi}</div>
                        <div className="text-xs text-muted-foreground">{it.tanggal}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Catatan terakhir</h4>
                <p className="text-sm text-foreground bg-muted/60 rounded-lg p-3 leading-relaxed">
                  Nasabah meminta simulasi cicilan untuk KPR dengan tenor 15 tahun dan DP 20%.
                  Officer akan menghubungi kembali untuk melengkapi dokumen.
                </p>
              </section>

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Next action</h4>
                <ul className="text-sm text-navy space-y-1.5 list-disc list-inside">
                  <li>Kirim simulasi KPR via WhatsApp</li>
                  <li>Verifikasi dokumen pendukung</li>
                  <li>Jadwalkan kunjungan ke cabang</li>
                </ul>
              </section>

              <div className="grid gap-2 pt-3 border-t border-border">
                <Button onClick={() => updateLead(selected.id, { status: "Terhubungi" })} className="w-full justify-start bg-success text-success-foreground hover:bg-success/90">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Tandai Sudah Follow-up
                </Button>
                <Button onClick={() => updateLead(selected.id, { status: "Eskalasi", sla: "Risiko" })} variant="outline" className="w-full justify-start border-danger/30 text-danger hover:bg-danger-light">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Eskalasi ke Supervisor
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" /> Jadwalkan Reminder
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
