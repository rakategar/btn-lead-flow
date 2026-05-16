import { useEffect, useMemo, useState } from "react";
import { Phone, MessageSquare, Calendar, CheckCircle2, Crown, UserRound, Plus, Trash2, ListChecks, StickyNote, BellRing, Check, Image as ImageIcon } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { picActivities, leaders, type Priority, type RmActivity } from "@/lib/dummy-data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ---- Models ---------------------------------------------------------------
interface Task {
  id: string;
  title: string;
  detail?: string | null;
  priority: Priority;
  assignee: string | null;
  done: boolean;
  createdBy: string;
}
type TaskRow = {
  id: string; title: string; detail: string | null; priority: string;
  assignee: string | null; done: boolean; created_by: string;
};
const fromTask = (r: TaskRow): Task => ({
  id: r.id, title: r.title, detail: r.detail,
  priority: (r.priority as Priority) ?? "Medium",
  assignee: r.assignee, done: r.done, createdBy: r.created_by,
});

interface Note {
  id: string; rmName: string; leaderName: string; message: string;
  readAt: string | null; readBy: string | null; createdAt: string;
}
type NoteRow = {
  id: string; rm_name: string; leader_name: string; message: string;
  read_at: string | null; read_by: string | null; created_at: string;
};
const fromNote = (r: NoteRow): Note => ({
  id: r.id, rmName: r.rm_name, leaderName: r.leader_name, message: r.message,
  readAt: r.read_at, readBy: r.read_by, createdAt: r.created_at,
});

const priorityOrder: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export function ActivityDailyPage({ extraActivities = [] }: { extraActivities?: RmActivity[] } = {}) {
  const { user } = useAuth();
  const isLeader = user?.role === "leader";
  const isRM = user?.role === "rm";

  const teamRMs = useMemo<string[]>(() => {
    if (!user) return [];
    if (isLeader) return leaders.find((l) => l.name === user.name)?.rms ?? [];
    if (isRM) return [user.name];
    return [];
  }, [user, isLeader, isRM]);

  // Leader name relevan untuk RM (untuk filter notes yang dia terima)
  const leaderName = useMemo(() => {
    if (isLeader) return user!.name;
    if (isRM) return user!.leaderName ?? leaders.find((l) => l.rms.includes(user!.name))?.name ?? "";
    return "";
  }, [user, isLeader, isRM]);

  const visiblePics = picActivities.filter((p) => teamRMs.includes(p.pic));
  const scopeLabel = isLeader
    ? `Tim ${user!.name} · ${teamRMs.length} RM`
    : isRM
      ? `Hanya data Anda — ${user!.name}`
      : "Semua RM";

  // ---- State ---------------------------------------------------------------
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftPriority, setDraftPriority] = useState<Priority>("Medium");

  // Load + realtime
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [tRes, nRes] = await Promise.all([
        supabase.from("daily_tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("task_notes").select("*").order("created_at", { ascending: false }),
      ]);
      if (!mounted) return;
      if (tRes.error) toast.error("Gagal memuat tasks", { description: tRes.error.message });
      else setTasks((tRes.data ?? []).map((r) => fromTask(r as TaskRow)));
      if (nRes.error) toast.error("Gagal memuat notes", { description: nRes.error.message });
      else setNotes((nRes.data ?? []).map((r) => fromNote(r as NoteRow)));
      setLoading(false);
    })();

    const ch = supabase
      .channel("daily_board_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_tasks" }, (payload) => {
        setTasks((prev) => {
          if (payload.eventType === "INSERT") {
            const t = fromTask(payload.new as TaskRow);
            return prev.some((x) => x.id === t.id) ? prev : [t, ...prev];
          }
          if (payload.eventType === "UPDATE") {
            const t = fromTask(payload.new as TaskRow);
            return prev.map((x) => (x.id === t.id ? t : x));
          }
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { id: string }).id;
            return prev.filter((x) => x.id !== id);
          }
          return prev;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "task_notes" }, (payload) => {
        setNotes((prev) => {
          if (payload.eventType === "INSERT") {
            const n = fromNote(payload.new as NoteRow);
            return prev.some((x) => x.id === n.id) ? prev : [n, ...prev];
          }
          if (payload.eventType === "UPDATE") {
            const n = fromNote(payload.new as NoteRow);
            return prev.map((x) => (x.id === n.id ? n : x));
          }
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { id: string }).id;
            return prev.filter((x) => x.id !== id);
          }
          return prev;
        });
      })
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);

  // ---- Helpers -------------------------------------------------------------
  const tasksFor = (rm: string) =>
    tasks.filter((t) => t.assignee === rm)
      .sort((a, b) => Number(a.done) - Number(b.done) || priorityOrder[a.priority] - priorityOrder[b.priority]);

  const notesFor = (rm: string) =>
    notes.filter((n) => n.rmName === rm).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const unreadCountFor = (rm: string) => notesFor(rm).filter((n) => !n.readAt).length;

  // ---- RM actions: tasks ---------------------------------------------------
  const addOwnTask = async () => {
    if (!isRM || !user || !draftTitle.trim()) return;
    const title = draftTitle.trim();
    const optimistic: Task = {
      id: `tmp-${crypto.randomUUID()}`,
      title, detail: null, priority: draftPriority,
      assignee: user.name, done: false, createdBy: user.name,
    };
    setDraftTitle("");
    setTasks((prev) => [optimistic, ...prev]);
    const { data, error } = await supabase.from("daily_tasks").insert({
      title, priority: draftPriority, assignee: user.name, done: false, created_by: user.name,
    }).select("*").single();
    if (error) {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      toast.error("Gagal membuat task", { description: error.message });
    } else if (data) {
      const real = fromTask(data as TaskRow);
      setTasks((prev) => {
        const without = prev.filter((t) => t.id !== optimistic.id && t.id !== real.id);
        return [real, ...without];
      });
    }
  };

  const removeOwnTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const { error } = await supabase.from("daily_tasks").delete().eq("id", taskId);
    if (error) toast.error("Gagal hapus", { description: error.message });
  };

  const toggleDone = async (taskId: string) => {
    const cur = tasks.find((t) => t.id === taskId);
    if (!cur || cur.assignee !== user?.name) return;
    const next = !cur.done;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: next } : t)));
    const { error } = await supabase.from("daily_tasks").update({ done: next }).eq("id", taskId);
    if (error) toast.error("Gagal update", { description: error.message });
  };

  // ---- Leader actions: notes ----------------------------------------------
  const addNote = async (rm: string, message: string) => {
    if (!isLeader || !user || !message.trim()) return;
    const optimistic: Note = {
      id: `tmp-${crypto.randomUUID()}`,
      rmName: rm, leaderName: user.name, message: message.trim(),
      readAt: null, readBy: null, createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [optimistic, ...prev]);
    const { data, error } = await supabase.from("task_notes").insert({
      rm_name: rm, leader_name: user.name, message: message.trim(),
    }).select("*").single();
    if (error) {
      setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
      toast.error("Gagal kirim note", { description: error.message });
    } else if (data) {
      const real = fromNote(data as NoteRow);
      setNotes((prev) => {
        const without = prev.filter((n) => n.id !== optimistic.id && n.id !== real.id);
        return [real, ...without];
      });
      toast.success(`Note terkirim ke ${rm}`);
    }
  };

  // RM marks note as read
  const markNoted = async (noteId: string) => {
    if (!isRM || !user) return;
    const ts = new Date().toISOString();
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, readAt: ts, readBy: user.name } : n)));
    const { error } = await supabase.from("task_notes")
      .update({ read_at: ts, read_by: user.name })
      .eq("id", noteId);
    if (error) toast.error("Gagal menandai noted", { description: error.message });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Prospecting Hari Ini" value="24" hint="Kontak baru ditambahkan" icon={Phone} tone="blue" />
        <KpiCard title="Follow-Up Hari Ini" value="31" hint="Eksekusi pipeline FU1–FU3" icon={MessageSquare} tone="orange" />
        <KpiCard title="Appointment Hari Ini" value="9" hint="Meeting & kunjungan" icon={Calendar} tone="green" />
      </div>

      {/* Task Board */}
      <section className="panel p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold shrink-0"><ListChecks className="h-4 w-4" /></div>
            <div>
              <h3 className="font-bold text-navy">Task Board — Daily Activity</h3>
              <p className="text-xs text-muted-foreground">
                {loading ? "Memuat data dari Lovable Cloud…" : isLeader
                  ? "Pantau checklist tiap RM (read-only). Tulis note/instruksi per RM — RM akan menandai 'Noted' saat sudah dibaca."
                  : "Buat dan centang sendiri task harian Anda. Note dari Leader muncul di kolom Anda."}
              </p>
            </div>
          </div>
          <StatusBadge tone={isLeader ? "gold" : "blue"}>{scopeLabel}</StatusBadge>
        </div>

        {/* RM: form buat task sendiri */}
        {isRM && (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-3 flex flex-col sm:flex-row gap-2">
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOwnTask()}
              placeholder="Tulis task aktivitas hari ini, mis. Telpon nasabah X…"
              className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <select
              value={draftPriority}
              onChange={(e) => setDraftPriority(e.target.value as Priority)}
              className="h-9 px-2 text-sm rounded-md border border-input bg-background"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <Button onClick={addOwnTask} className="bg-navy hover:bg-navy/90 text-navy-foreground"><Plus className="h-4 w-4 mr-1.5" />Tambah Task</Button>
          </div>
        )}

        {/* Board */}
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {teamRMs.map((rm) => {
            const list = tasksFor(rm);
            const done = list.filter((t) => t.done).length;
            const pct = list.length === 0 ? 0 : Math.round((done / list.length) * 100);
            const rmNotes = notesFor(rm);
            const unread = unreadCountFor(rm);
            return (
              <RMColumn
                key={rm}
                rmName={rm}
                progress={pct}
                doneCount={done}
                totalCount={list.length}
                hasUnread={unread > 0}
                isLeaderView={isLeader}
              >
                {list.length === 0 && <Empty text={isRM ? "Belum ada task. Tambahkan di atas." : "RM belum membuat task hari ini."} />}
                {list.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    canCheck={isRM && t.assignee === user?.name}
                    onToggle={() => toggleDone(t.id)}
                    onRemove={isRM && t.assignee === user?.name ? () => removeOwnTask(t.id) : undefined}
                  />
                ))}

                {/* Notes section */}
                <NotesSection
                  rm={rm}
                  notes={rmNotes}
                  isLeader={isLeader}
                  isRM={isRM && rm === user?.name}
                  currentLeader={leaderName}
                  onSend={(msg) => addNote(rm, msg)}
                  onMarkNoted={markNoted}
                />
              </RMColumn>
            );
          })}
        </div>
      </section>

      {/* Monitoring Progress Tim (leader only) */}
      {isLeader && (
        <section className="panel p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-light text-[hsl(var(--gold))] shrink-0"><Crown className="h-4 w-4" /></div>
            <div>
              <h3 className="font-bold text-navy">Monitoring Progress Tim</h3>
              <p className="text-xs text-muted-foreground">Progress eksekusi task harian per RM.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teamRMs.map((rm) => {
              const list = tasks.filter((t) => t.assignee === rm);
              const done = list.filter((t) => t.done).length;
              const pct = list.length === 0 ? 0 : Math.round((done / list.length) * 100);
              return (
                <div key={rm} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-navy">{rm}</div>
                    <span className="text-xs text-muted-foreground">{done}/{list.length}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", pct >= 80 ? "bg-success" : pct >= 50 ? "bg-[hsl(var(--gold))]" : "bg-primary")} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{pct}% selesai</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PIC table */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-navy">Aktivitas Per RM Hari Ini</h3>
            <p className="text-xs text-muted-foreground">Membantu visibilitas konsistensi aktivitas harian per personel.</p>
          </div>
          <StatusBadge tone={isRM ? "blue" : "gold"}>{scopeLabel}</StatusBadge>
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

// ---- Sub-components --------------------------------------------------------

function RMColumn({
  rmName, progress, doneCount, totalCount, hasUnread, isLeaderView, children,
}: {
  rmName: string; progress: number; doneCount: number; totalCount: number;
  hasUnread: boolean; isLeaderView: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-muted/40 p-3 flex flex-col min-h-[220px] transition-colors",
      hasUnread && isLeaderView ? "border-[hsl(var(--gold))] bg-gold-light/40" : "border-border"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-light text-primary">
          <UserRound className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-bold text-navy truncate">{rmName}</div>
            {hasUnread && isLeaderView && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--gold))] text-navy text-[10px] font-bold px-1.5 py-0.5">
                <BellRing className="h-2.5 w-2.5" /> Belum dibaca
              </span>
            )}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{doneCount}/{totalCount} selesai</div>
        </div>
      </div>
      <div className="mb-2 h-1.5 rounded-full bg-card overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", progress >= 80 ? "bg-success" : progress >= 50 ? "bg-[hsl(var(--gold))]" : "bg-primary")} style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-col gap-2 flex-1">{children}</div>
    </div>
  );
}

function TaskCard({ task, canCheck, onToggle, onRemove }: {
  task: Task; canCheck?: boolean; onToggle?: () => void; onRemove?: () => void;
}) {
  return (
    <div className={cn(
      "group rounded-lg border border-border bg-card p-2.5 shadow-soft hover:shadow-card transition-shadow",
      task.done && "opacity-70"
    )}>
      <div className="flex items-start gap-2">
        {canCheck ? (
          <button onClick={onToggle} aria-label="Tandai selesai" className="mt-0.5 shrink-0">
            <CheckCircle2 className={cn("h-4 w-4", task.done ? "text-success" : "text-muted-foreground hover:text-primary")} />
          </button>
        ) : (
          <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0", task.done ? "text-success" : "text-muted-foreground/50")} />
        )}
        <div className="flex-1 min-w-0">
          <div className={cn("text-sm font-medium text-navy", task.done && "line-through text-muted-foreground")}>{task.title}</div>
          {task.detail && <div className="text-[11px] text-muted-foreground mt-0.5">{task.detail}</div>}
          <div className="mt-1.5 flex items-center gap-1.5">
            <StatusBadge tone={statusToTone(task.priority)}>{task.priority}</StatusBadge>
            <span className="text-[10px] text-muted-foreground">oleh {task.createdBy}</span>
          </div>
        </div>
        {onRemove && (
          <button onClick={onRemove} aria-label="Hapus" className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-danger-light text-muted-foreground hover:text-danger">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function NotesSection({
  rm, notes, isLeader, isRM, currentLeader, onSend, onMarkNoted,
}: {
  rm: string; notes: Note[]; isLeader: boolean; isRM: boolean;
  currentLeader: string;
  onSend: (msg: string) => void;
  onMarkNoted: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  if (notes.length === 0 && !isLeader && !isRM) return null;

  return (
    <div className="mt-2 rounded-lg border border-dashed border-border bg-card/60 p-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <StickyNote className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
        <span className="text-[11px] uppercase tracking-wider font-semibold text-navy">Note dari Leader</span>
      </div>

      {notes.length === 0 && (
        <div className="text-[11px] text-muted-foreground italic mb-2">Belum ada note untuk {rm}.</div>
      )}

      <div className="flex flex-col gap-1.5 mb-2">
        {notes.map((n) => {
          const isUnread = !n.readAt;
          return (
            <div
              key={n.id}
              className={cn(
                "rounded-md border p-2 text-[12px]",
                isUnread ? "border-[hsl(var(--gold))] bg-gold-light/60" : "border-border bg-card"
              )}
            >
              <div className="text-navy">{n.message}</div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                <span>{n.leaderName} · {new Date(n.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</span>
                {n.readAt ? (
                  <span className="inline-flex items-center gap-1 text-success font-medium">
                    <Check className="h-3 w-3" /> Noted oleh {n.readBy} · {new Date(n.readAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                  </span>
                ) : isRM ? (
                  <button
                    onClick={() => onMarkNoted(n.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-navy text-navy-foreground px-2 py-0.5 font-semibold hover:bg-navy/90"
                  >
                    Noted ✓
                  </button>
                ) : (
                  <span className="text-[hsl(var(--gold))] font-semibold">Belum dibaca</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isLeader && (
        <div className="flex gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                onSend(draft); setDraft("");
              }
            }}
            placeholder={`Tulis note untuk ${rm}…`}
            className="flex-1 h-8 px-2 text-[12px] rounded-md border border-input bg-background"
          />
          <Button
            size="sm"
            className="h-8 bg-navy hover:bg-navy/90 text-navy-foreground"
            onClick={() => { if (draft.trim()) { onSend(draft); setDraft(""); } }}
          >
            Kirim
          </Button>
        </div>
      )}

      {isRM && currentLeader && (
        <div className="text-[10px] text-muted-foreground italic">Note dari Leader Anda — {currentLeader}</div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 p-3 text-[11px] text-muted-foreground text-center">{text}</div>
  );
}
