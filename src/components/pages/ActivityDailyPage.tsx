import { useMemo, useState } from "react";
import { Phone, MessageSquare, Calendar, CheckCircle2, BookOpen, Crown, UserRound, Plus, Trash2, GripVertical, Inbox, ListChecks } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { picActivities, leaders, type Priority } from "@/lib/dummy-data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ---- Task model -------------------------------------------------------------
interface Task {
  id: string;
  title: string;
  detail?: string;
  priority: Priority;
  assignee: string | null; // null = backlog (belum di-assign)
  done: boolean;
  createdBy: string;
}

const seedTasks: Task[] = [
  { id: "T-001", title: "Follow-up Andi Pratama (FU1)", detail: "Kirim simulasi cicilan KPR.", priority: "High", assignee: "Rina A.", done: true, createdBy: "Andre Wibowo" },
  { id: "T-002", title: "Submit dokumen Siti Rahma", detail: "Verifikasi checklist final closing.", priority: "High", assignee: "Dimas R.", done: false, createdBy: "Andre Wibowo" },
  { id: "T-003", title: "Prospecting kawasan Permata Hijau", detail: "Minimal 3 kontak baru.", priority: "Medium", assignee: "Lala N.", done: false, createdBy: "Andre Wibowo" },
  { id: "T-004", title: "Coaching objection handling", detail: "Sesi 30 menit untuk produk Take Over.", priority: "Medium", assignee: "Maya P.", done: false, createdBy: "Sari Trihandayani" },
  { id: "T-005", title: "Update pipeline Q2", detail: "Pastikan stage & next FU semua lead terisi.", priority: "Low", assignee: "Fajar H.", done: false, createdBy: "Sari Trihandayani" },
  { id: "T-006", title: "Survey kebutuhan KPR di event partner", priority: "Medium", assignee: null, done: false, createdBy: "Andre Wibowo" },
  { id: "T-007", title: "Recap meeting nasabah Dewi Lestari", priority: "High", assignee: null, done: false, createdBy: "Andre Wibowo" },
];

const priorityOrder: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export function ActivityDailyPage() {
  const { user } = useAuth();
  const isLeader = user?.role === "leader";

  const teamRMs = useMemo<string[]>(() => {
    if (!user) return [];
    if (isLeader) return leaders.find((l) => l.name === user.name)?.rms ?? [];
    return [user.name];
  }, [user, isLeader]);

  // Role-based scoping aktivitas harian per RM
  const visiblePics = picActivities.filter((p) => teamRMs.includes(p.pic));

  const scopeLabel = user?.role === "leader"
    ? `Tim ${user.name} · ${visiblePics.length} RM`
    : user?.role === "rm"
      ? `Hanya data Anda — ${user.name}`
      : "Semua RM";

  // ---- Task board state ----------------------------------------------------
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftPriority, setDraftPriority] = useState<Priority>("Medium");
  const [dragId, setDragId] = useState<string | null>(null);

  // Tasks yang relevan dengan scope user
  const scopedTasks = tasks.filter((t) => {
    if (isLeader) {
      // leader: backlog miliknya + tasks tim-nya
      if (t.assignee === null) return t.createdBy === user!.name;
      return teamRMs.includes(t.assignee);
    }
    return t.assignee === user?.name; // RM hanya tasks-nya
  });

  const backlog = scopedTasks.filter((t) => t.assignee === null)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const tasksFor = (rm: string) => scopedTasks
    .filter((t) => t.assignee === rm)
    .sort((a, b) => Number(a.done) - Number(b.done) || priorityOrder[a.priority] - priorityOrder[b.priority]);

  const addTask = () => {
    if (!user || !isLeader || !draftTitle.trim()) return;
    const id = `T-${(tasks.length + 1).toString().padStart(3, "0")}`;
    setTasks((prev) => [{ id, title: draftTitle.trim(), priority: draftPriority, assignee: null, done: false, createdBy: user.name }, ...prev]);
    setDraftTitle("");
    toast.success("Task baru masuk Backlog", { description: "Drag ke kolom RM untuk meng-assign." });
  };

  const assignTo = (taskId: string, rm: string | null) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, assignee: rm } : t));
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const toggleDone = (taskId: string) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  const onDrop = (rm: string | null) => {
    if (!dragId || !isLeader) return;
    assignTo(dragId, rm);
    setDragId(null);
  };

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
            <h3 className="font-bold text-navy">Asal Task Harian</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Task diturunkan dari kerangka <span className="font-semibold text-navy">A.C.T — Action Daily</span> + SOP Sales Discipline. Sales Leader merumuskan task, lalu meng-assign ke setiap RM.
            </p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-4 text-xs">
              <FlowStep n={1} title="Kerangka A.C.T" desc="Action · Control · Track menjadi pondasi ritme." />
              <FlowStep n={2} title="SOP Sales Discipline" desc="Standar perilaku harian sales." />
              <FlowStep n={3} title="Target Bulanan" desc="Diturunkan menjadi target harian per RM." />
              <FlowStep n={4} title="Daily Task" desc="Leader buat & assign, RM eksekusi & centang." />
            </ol>
          </div>
        </div>
      </section>

      {/* Task Board */}
      <section className="panel p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold shrink-0"><ListChecks className="h-4 w-4" /></div>
            <div>
              <h3 className="font-bold text-navy">Task Board — Daily Activity</h3>
              <p className="text-xs text-muted-foreground">
                {isLeader
                  ? "Buat task, lalu drag ke kolom RM untuk meng-assign. Pantau progress secara real-time."
                  : "Task yang ditugaskan Sales Leader untuk Anda. Centang setiap task yang sudah dieksekusi."}
              </p>
            </div>
          </div>
          <StatusBadge tone={isLeader ? "gold" : "blue"}>{scopeLabel}</StatusBadge>
        </div>

        {/* Form Leader */}
        {isLeader && (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-3 flex flex-col sm:flex-row gap-2">
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Tulis task baru, mis. Follow-up nasabah X di KC Tangerang…"
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
            <Button onClick={addTask} className="bg-navy hover:bg-navy/90 text-navy-foreground"><Plus className="h-4 w-4 mr-1.5" />Buat Task</Button>
          </div>
        )}

        {/* Board */}
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {/* Backlog (hanya leader) */}
          {isLeader && (
            <BoardColumn
              title="Backlog"
              caption={`${backlog.length} belum di-assign`}
              icon={Inbox}
              tone="navy"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(null)}
            >
              {backlog.length === 0 && (
                <Empty text="Tidak ada task tersisa di Backlog." />
              )}
              {backlog.map((t) => (
                <TaskCard key={t.id} task={t} draggable={isLeader} onDragStart={() => setDragId(t.id)} onRemove={() => removeTask(t.id)} canCheck={false} />
              ))}
            </BoardColumn>
          )}

          {/* Kolom per RM */}
          {teamRMs.map((rm) => {
            const list = tasksFor(rm);
            const done = list.filter((t) => t.done).length;
            const pct = list.length === 0 ? 0 : Math.round((done / list.length) * 100);
            return (
              <BoardColumn
                key={rm}
                title={rm}
                caption={`${done}/${list.length} selesai`}
                progress={pct}
                icon={UserRound}
                tone="blue"
                onDragOver={(e) => isLeader && e.preventDefault()}
                onDrop={() => onDrop(rm)}
              >
                {list.length === 0 && <Empty text={isLeader ? "Drop task ke sini untuk meng-assign." : "Belum ada task ditugaskan."} />}
                {list.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    draggable={isLeader}
                    onDragStart={() => setDragId(t.id)}
                    onRemove={isLeader ? () => removeTask(t.id) : undefined}
                    canCheck
                    onToggle={() => toggleDone(t.id)}
                  />
                ))}
              </BoardColumn>
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

// ---- Board sub-components ---------------------------------------------------

function BoardColumn({
  title, caption, icon: Icon, tone, progress, onDragOver, onDrop, children,
}: {
  title: string; caption?: string; icon: React.ComponentType<{ className?: string }>;
  tone: "navy" | "blue"; progress?: number;
  onDragOver?: (e: React.DragEvent) => void; onDrop?: (e: React.DragEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div onDragOver={onDragOver} onDrop={onDrop}
      className="rounded-xl border border-border bg-muted/40 p-3 flex flex-col min-h-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", tone === "navy" ? "bg-navy text-gold" : "bg-primary-light text-primary")}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-navy truncate">{title}</div>
          {caption && <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{caption}</div>}
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="mb-2 h-1.5 rounded-full bg-card overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", progress >= 80 ? "bg-success" : progress >= 50 ? "bg-[hsl(var(--gold))]" : "bg-primary")} style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="flex flex-col gap-2 flex-1">{children}</div>
    </div>
  );
}

function TaskCard({ task, draggable, onDragStart, onRemove, canCheck, onToggle }: {
  task: Task; draggable?: boolean; onDragStart?: () => void;
  onRemove?: () => void; canCheck?: boolean; onToggle?: () => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        "group rounded-lg border border-border bg-card p-2.5 shadow-soft hover:shadow-card transition-shadow",
        draggable && "cursor-grab active:cursor-grabbing",
        task.done && "opacity-70"
      )}
    >
      <div className="flex items-start gap-2">
        {draggable && <GripVertical className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
        {canCheck && (
          <button onClick={onToggle} aria-label="Tandai selesai" className="mt-0.5 shrink-0">
            <CheckCircle2 className={cn("h-4 w-4", task.done ? "text-success" : "text-muted-foreground hover:text-primary")} />
          </button>
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

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 p-3 text-[11px] text-muted-foreground text-center">{text}</div>
  );
}
