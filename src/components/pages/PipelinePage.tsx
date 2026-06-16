import { useState, useMemo } from "react";
import { Search, X, Flame, Droplet, Snowflake, MessageSquare, Calendar, RefreshCw, Users, Sparkles, AlertTriangle, StickyNote, Send, ChevronUp, ChevronDown, Eye, MoreHorizontal, ChevronLeft, ChevronRight, Trash2, Tag, UserCheck, Workflow } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
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

type SortKey = "nama" | "stage" | "priority" | "status" | "pic" | "leader";
type SortDir = "asc" | "desc";
const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function PipelinePage({ leads, setLeads, globalSearch }: Props) {
  const [status, setStatus] = useState<typeof statusFilters[number]>("Semua");
  const [progress, setProgress] = useState<typeof progressFilters[number]>("Semua");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Lead | null>(null);
  const [aiLead, setAiLead] = useState<Lead | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const { user } = useAuth();
  const isLeader = user?.role === "leader";

  const search = (q || globalSearch).toLowerCase();
  const filtered = useMemo(() => {
    let result = leads.filter((l) =>
      (status === "Semua" || l.priority === status) &&
      (progress === "Semua" || l.status === progress) &&
      (search === "" || l.nama.toLowerCase().includes(search) || l.pic.toLowerCase().includes(search) || l.leader.toLowerCase().includes(search) || l.id.toLowerCase().includes(search))
    );
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const va = String(a[sortKey] ?? "").toLowerCase();
        const vb = String(b[sortKey] ?? "").toLowerCase();
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return result;
  }, [leads, status, progress, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    setSelected((prev) => prev.size === paginated.length ? new Set() : new Set(paginated.map((l) => l.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const updateStatus = (id: string, newStatus: ResolutionStatus) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    setOpen((o) => o && o.id === id ? { ...o, status: newStatus } : o);
  };

  const updateStage = (id: string, newStage: PipelineStage) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, stage: newStage, lastActivity: newStage === "Meet" ? "Meeting dijadwalkan" : l.lastActivity } : l));
    setOpen((o) => o && o.id === id ? { ...o, stage: newStage } : o);
  };

  const addNote = (id: string, message: string) => {
    const note: LeadNote = { id: `n-${Date.now()}`, leader: user?.name || "Leader", message, ts: new Date().toISOString() };
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, notes: [...(l.notes ?? []), note] } : l));
    setOpen((o) => o && o.id === id ? { ...o, notes: [...(o.notes ?? []), note] } : o);
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
              {t === "Medium" && <Droplet className="h-3.5 w-3.5 text-primary" />}
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
        <LegendCard tone="blue" title="Warm · 30%–60%" desc="Butuh nurturing dan follow-up berkala." />
        <LegendCard tone="blue" title="Cold · 0%–20%" desc="Simpan dalam radar untuk nurture jangka panjang." />
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="panel p-3 flex items-center gap-3 border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary-light))] animate-fade-in-down">
          <span className="text-sm font-semibold text-[hsl(var(--primary))]">{selected.size} lead dipilih</span>
          <div className="flex items-center gap-2 ml-2">
            <Button variant="outline" size="sm"><UserCheck className="h-3.5 w-3.5" /> Assign</Button>
            <Button variant="outline" size="sm"><Tag className="h-3.5 w-3.5" /> Tag</Button>
            <Button variant="outline-danger" size="sm"><Trash2 className="h-3.5 w-3.5" /> Hapus</Button>
          </div>
          <button onClick={clearSelection} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">Batal pilih</button>
        </div>
      )}

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center gap-3">
          <div>
            <h3 className="font-bold text-navy text-sm">Daftar Lead</h3>
            <p className="text-xs text-muted-foreground">{filtered.length} lead · halaman {currentPage}/{totalPages}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Baris per halaman</label>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
              aria-label="Jumlah baris per halaman"
            >
              {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Daftar lead pipeline">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground sticky top-0">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua"
                    checked={paginated.length > 0 && selected.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="rounded border-input accent-primary"
                  />
                </th>
                <SortableTh label="Nama Lead" sortKey="nama" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Stage" sortKey="stage" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Status" sortKey="priority" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label="RM" sortKey="pic" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Leader" sortKey="leader" current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th>Last Activity</Th>
                <Th>Next FU</Th>
                <SortableTh label="Progress" sortKey="status" current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th className="text-center w-24">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      icon={Workflow}
                      title="Tidak ada lead ditemukan"
                      description={search ? `Tidak ada lead yang cocok dengan "${search}". Coba filter atau kata kunci lain.` : "Belum ada lead sesuai filter yang dipilih."}
                      compact
                    />
                  </td>
                </tr>
              )}
              {paginated.map((l) => (
                <tr
                  key={l.id}
                  className={cn(
                    "hover:bg-muted/40 cursor-pointer transition-colors",
                    selected.has(l.id) && "bg-[hsl(var(--primary-light))]/50"
                  )}
                  onClick={() => setOpen(l)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Pilih ${l.nama}`}
                      checked={selected.has(l.id)}
                      onChange={() => toggleSelect(l.id)}
                      className="rounded border-input accent-primary"
                    />
                  </td>
                  <Td>
                    <div className="font-semibold text-navy">{l.nama}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{l.id}</div>
                  </Td>
                  <Td><StatusBadge tone="navy">{l.stage}</StatusBadge></Td>
                  <Td><StatusBadge tone={statusToTone(l.priority)} dot>{statusLabel[l.priority]}</StatusBadge></Td>
                  <Td className="text-navy">{l.pic}</Td>
                  <Td className="text-navy">{l.leader}</Td>
                  <Td className="text-muted-foreground text-xs">{l.lastActivity}</Td>
                  <Td className="text-navy text-xs">{l.nextFollowUp}</Td>
                  <Td><StatusBadge tone={statusToTone(l.status)}>{l.status}</StatusBadge></Td>
                  <Td className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setOpen(l)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-[hsl(var(--primary-light))] transition-colors"
                        title="Lihat detail"
                        aria-label={`Lihat detail ${l.nama}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === l.id ? null : l.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Aksi lainnya"
                          aria-label="Aksi lainnya"
                          aria-expanded={openActionMenu === l.id}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        {openActionMenu === l.id && (
                          <div className="absolute right-0 top-full mt-1 z-10 w-44 rounded-lg border border-border bg-card shadow-lg py-1 animate-fade-in-down">
                            <button onClick={() => { updateStatus(l.id, "In Progress"); setOpenActionMenu(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 text-primary" /> In Progress</button>
                            <button onClick={() => { updateStatus(l.id, "Follow Up"); setOpenActionMenu(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-[hsl(var(--warning))]" /> Follow Up</button>
                            <button onClick={() => { updateStatus(l.id, "Close"); setOpenActionMenu(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> Close</button>
                            <div className="border-t border-border my-1" />
                            <button onClick={() => { setAiLead(l); setOpenActionMenu(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary" /> Draft AI</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filtered.length)} dari {filtered.length} lead
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) p = i + 1;
                  else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                  else p = currentPage - 2 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={cn(
                      "h-7 min-w-[28px] px-1.5 rounded-md text-xs font-medium transition-colors",
                      currentPage === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={currentPage === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
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
                  <div className="rounded-lg border border-primary/40 bg-primary-light/40 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
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

              {isLeader ? (
                <div className="space-y-3 pt-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-navy">
                      <StickyNote className="h-3.5 w-3.5 text-primary" /> Catatan Leader
                      <StatusBadge tone="blue">{(open.notes ?? []).length}</StatusBadge>
                    </div>
                    {(open.notes ?? []).length === 0 && (
                      <div className="text-[11px] text-muted-foreground italic">Belum ada catatan untuk lead ini.</div>
                    )}
                    <div className="space-y-1.5">
                      {(open.notes ?? []).slice().reverse().map((n) => (
                        <div key={n.id} className="rounded-md border border-border bg-card p-2 text-[12px]">
                          <div className="text-navy">{n.message}</div>
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {n.leader} · {new Date(n.ts).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {showNoteInput ? (
                      <div className="flex gap-1.5">
                        <input
                          autoFocus
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && noteDraft.trim()) {
                              addNote(open.id, noteDraft.trim());
                              setNoteDraft(""); setShowNoteInput(false);
                            }
                          }}
                          placeholder="Tulis catatan untuk lead ini…"
                          className="flex-1 h-9 px-2 text-sm rounded-md border border-input bg-background"
                        />
                        <Button
                          size="sm"
                          className="h-9 bg-navy hover:bg-navy/90 text-navy-foreground"
                          onClick={() => {
                            if (noteDraft.trim()) {
                              addNote(open.id, noteDraft.trim());
                              setNoteDraft(""); setShowNoteInput(false);
                            }
                          }}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowNoteInput(true)}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Tambah Catatan
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => setAiLead(open)} className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"><Sparkles className="h-4 w-4 mr-1.5" />Generate Draft FU dengan AI</Button>
                  <Button onClick={() => updateStatus(open.id, "In Progress")} className="bg-primary"><RefreshCw className="h-4 w-4 mr-1.5" />Update Status: In Progress</Button>
                  <Button onClick={() => updateStage(open.id, "Meet")} className="bg-navy hover:bg-navy/90 text-navy-foreground"><Users className="h-4 w-4 mr-1.5" />Tandai Meeting</Button>
                  <Button onClick={() => updateStatus(open.id, "Close")} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">Tandai Close</Button>
                  <Button variant="outline" onClick={() => updateStatus(open.id, "Follow Up")}><Calendar className="h-4 w-4 mr-1.5" />Jadwalkan Follow-Up</Button>
                  <Button variant="outline"><MessageSquare className="h-4 w-4 mr-1.5" />Tambah Catatan</Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {aiLead && <AiFollowUpDraftModal lead={aiLead} onClose={() => setAiLead(null)} />}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("text-left font-semibold px-4 py-3", className)}>{children}</th>;
}
function SortableTh({ label, sortKey, current, dir, onSort }: { label: string; sortKey: SortKey; current: SortKey | null; dir: SortDir; onSort: (k: SortKey) => void }) {
  const active = current === sortKey;
  return (
    <th className="text-left px-4 py-3">
      <button
        onClick={() => onSort(sortKey)}
        className={cn("flex items-center gap-1 font-semibold hover:text-foreground transition-colors", active ? "text-[hsl(var(--primary))]" : "text-muted-foreground")}
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        {label}
        <span className="flex flex-col">
          <ChevronUp className={cn("h-2.5 w-2.5 -mb-0.5", active && dir === "asc" ? "text-[hsl(var(--primary))]" : "text-muted-foreground/40")} />
          <ChevronDown className={cn("h-2.5 w-2.5", active && dir === "desc" ? "text-[hsl(var(--primary))]" : "text-muted-foreground/40")} />
        </span>
      </button>
    </th>
  );
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
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
function LegendCard({ tone, title, desc }: { tone: "red" | "blue"; title: string; desc: string }) {
  const cls = tone === "red" ? "border-l-[hsl(var(--danger))]" : "border-l-primary";
  return (
    <div className={cn("panel p-4 border-l-4", cls)}>
      <div className="text-sm font-bold text-navy">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </div>
  );
}
