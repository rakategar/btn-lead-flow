import { useState } from "react";
import { Search, X, Flame, Droplet, Snowflake, MessageSquare, Calendar, RefreshCw, Users, Sparkles, AlertTriangle, StickyNote, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { type Lead, type Priority, type ResolutionStatus, type PipelineStage, type LeadNote } from "@/lib/dummy-data";
import { AiFollowUpDraftModal } from "@/components/ai/AiFollowUpDraftModal";
import { checkLeadQuality } from "@/lib/ai-sales";
import { useAuth } from "@/lib/auth";

// Catatan terminologi:
// - "Status" lead = temperatur lead (Hot / Warm / Cold)
// - "Progress" lead = posisi penyelesaian (In Progress / Follow Up / Close / Not Eligible)
const statusFilters: ("Semua" | Priority)[] = ["Semua", "High", "Medium", "Low"];
const statusLabel: Record<Priority, string> = { High: "Hot", Medium: "Warm", Low: "Cold" };
const progressFilters: ("Semua" | ResolutionStatus)[] = ["Semua", "In Progress", "Follow Up", "Close", "Not Eligible"];

interface Props {
  leads: Lead[];
  setLeads: (l: Lead[] | ((p: Lead[]) => Lead[])) => void;
  globalSearch: string;
}

export function PipelinePage({ leads, setLeads, globalSearch }: Props) {
  const [status, setStatus] = useState<typeof statusFilters[number]>("Semua");
  const [progress, setProgress] = useState<typeof progressFilters[number]>("Semua");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Lead | null>(null);
  const [aiLead, setAiLead] = useState<Lead | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const { user } = useAuth();
  const isLeader = user?.role === "leader";

  const search = (q || globalSearch).toLowerCase();
  const filtered = leads.filter((l) =>
    (status === "Semua" || l.priority === status) &&
    (progress === "Semua" || l.status === progress) &&
    (search === "" || l.nama.toLowerCase().includes(search) || l.pic.toLowerCase().includes(search) || l.leader.toLowerCase().includes(search) || l.id.toLowerCase().includes(search))
  );

  const updateStatus = (id: string, newStatus: ResolutionStatus) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    setOpen((o) => o && o.id === id ? { ...o, status: newStatus } : o);
  };

  const updateStage = (id: string, newStage: PipelineStage) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, stage: newStage, lastActivity: newStage === "Meet" ? "Meeting dijadwalkan" : l.lastActivity } : l));
    setOpen((o) => o && o.id === id ? { ...o, stage: newStage } : o);
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="panel p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Status</span>
          {statusFilters.map((t) => (
            <Chip key={t} active={status === t} onClick={() => setStatus(t)}>
              {t === "High" && <Flame className="h-3.5 w-3.5 text-danger" />}
              {t === "Medium" && <Droplet className="h-3.5 w-3.5 text-accent" />}
              {t === "Low" && <Snowflake className="h-3.5 w-3.5 text-primary" />}
              {t === "Semua" ? t : statusLabel[t]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Progress</span>
          {progressFilters.map((s) => (
            <Chip key={s} active={progress === s} onClick={() => setProgress(s)}>{s}</Chip>
          ))}
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari lead, RM, Leader, ID" className="h-9 pl-9 pr-3 text-sm rounded-lg border border-input bg-background w-56 focus:outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div className="grid gap-3 md:grid-cols-3">
        <LegendCard tone="red" title="Hot · 70%–90%" desc="Prioritas eksekusi cepat — siap ditransaksikan." />
        <LegendCard tone="orange" title="Warm · 30%–60%" desc="Butuh nurturing dan follow-up berkala." />
        <LegendCard tone="blue" title="Cold · 0%–20%" desc="Simpan dalam radar untuk nurture jangka panjang." />
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy">Daftar Lead</h3>
            <p className="text-xs text-muted-foreground">{filtered.length} lead ditampilkan dari total {leads.length}.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>Nama Lead</Th>
                <Th>Stage</Th>
                <Th>Status</Th>
                <Th>RM</Th>
                <Th>Leader</Th>
                <Th>Last Activity</Th>
                <Th>Next FU</Th>
                <Th>Progress</Th>
                <Th className="text-right pr-5">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">Tidak ada lead sesuai filter.</td></tr>
              )}
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setOpen(l)}>
                  <Td>
                    <div className="font-medium text-navy">{l.nama}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{l.id}</div>
                  </Td>
                  <Td><StatusBadge tone="navy">{l.stage}</StatusBadge></Td>
                  <Td><StatusBadge tone={statusToTone(l.priority)} dot>{statusLabel[l.priority]}</StatusBadge></Td>
                  <Td className="text-navy">{l.pic}</Td>
                  <Td className="text-navy">{l.leader}</Td>
                  <Td className="text-muted-foreground">{l.lastActivity}</Td>
                  <Td className="text-navy">{l.nextFollowUp}</Td>
                  <Td><StatusBadge tone={statusToTone(l.status)}>{l.status}</StatusBadge></Td>
                  <Td className="text-right pr-5"><Button variant="ghost" size="sm" className="text-primary" onClick={(e) => { e.stopPropagation(); setOpen(l); }}>Lihat</Button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(null)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-xl border-l border-border overflow-y-auto animate-fade-in">
            <div className="p-5 border-b border-border flex items-start justify-between">
              <div>
                <div className="text-[11px] font-mono text-muted-foreground">{open.id}</div>
                <h3 className="text-lg font-bold text-navy">{open.nama}</h3>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <StatusBadge tone="navy">{open.stage}</StatusBadge>
                  <StatusBadge tone={statusToTone(open.priority)} dot>{statusLabel[open.priority]}</StatusBadge>
                  <StatusBadge tone={statusToTone(open.status)}>{open.status}</StatusBadge>
                </div>
              </div>
              <button onClick={() => setOpen(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" aria-label="Tutup">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <Row label="Tahap pipeline" value={open.stage} />
              <Row label="Status" value={statusLabel[open.priority]} />
              <Row label="RM" value={open.pic} />
              <Row label="Leader" value={open.leader} />
              <Row label="Sumber lead" value={open.source} />
              <Row label="Minat produk" value={open.produk} />
              <Row label="Aktivitas terakhir" value={open.lastActivity} />
              <Row label="Jadwal follow-up" value={`${open.fuStage} · ${open.nextFollowUp}`} />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Ringkasan kebutuhan</div>
                <div className="rounded-lg bg-muted/50 p-3 text-navy">{open.ringkasan}</div>
              </div>

              {/* AI Data Quality Check */}
              {(() => {
                const qIssues = checkLeadQuality(open);
                if (qIssues.length === 0) return null;
                return (
                  <div className="rounded-lg border border-accent/40 bg-accent-light/40 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-accent font-semibold text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" /> AI Data Quality · perlu review
                    </div>
                    <ul className="text-xs text-navy space-y-1">
                      {qIssues.map((i, idx) => (
                        <li key={idx}><span className="font-mono text-[10px] uppercase text-muted-foreground">{i.field}</span> — {i.message}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={() => setAiLead(open)} className="bg-[hsl(var(--gold))] text-navy hover:bg-[hsl(var(--gold))]/90"><Sparkles className="h-4 w-4 mr-1.5" />Generate Draft FU dengan AI</Button>
                <Button onClick={() => updateStatus(open.id, "In Progress")} className="bg-primary"><RefreshCw className="h-4 w-4 mr-1.5" />Update Status: In Progress</Button>
                <Button onClick={() => updateStage(open.id, "Meet")} className="bg-navy hover:bg-navy/90 text-navy-foreground"><Users className="h-4 w-4 mr-1.5" />Tandai Meeting</Button>
                <Button onClick={() => updateStatus(open.id, "Close")} className="bg-success hover:bg-success/90 text-success-foreground">Tandai Close</Button>
                <Button variant="outline" onClick={() => updateStatus(open.id, "Follow Up")}><Calendar className="h-4 w-4 mr-1.5" />Jadwalkan Follow-Up</Button>
                <Button variant="outline"><MessageSquare className="h-4 w-4 mr-1.5" />Tambah Catatan</Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {aiLead && <AiFollowUpDraftModal lead={aiLead} onClose={() => setAiLead(null)} />}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("text-left font-semibold px-5 py-3", className)}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3 align-middle", className)}>{children}</td>;
}
function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
      active ? "bg-navy text-navy-foreground border-navy" : "bg-card text-muted-foreground border-border hover:border-navy/40"
    )}>{children}</button>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-navy text-right">{value}</span>
    </div>
  );
}
function LegendCard({ tone, title, desc }: { tone: "red" | "orange" | "blue"; title: string; desc: string }) {
  const cls = tone === "red" ? "border-l-danger" : tone === "orange" ? "border-l-accent" : "border-l-primary";
  return (
    <div className={cn("panel p-4 border-l-4", cls)}>
      <div className="text-sm font-bold text-navy">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </div>
  );
}
