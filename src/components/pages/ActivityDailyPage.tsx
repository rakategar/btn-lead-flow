import { useEffect, useMemo, useState } from "react";
import { Phone, MessageSquare, Calendar, CheckCircle2, Crown, UserRound, ListChecks, StickyNote, Image as ImageIcon, Flame, Thermometer, Snowflake, ClipboardList, Plus } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToTone } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { picActivities, leaders, type Lead, type RmActivity } from "@/lib/dummy-data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { setActivityDone } from "@/lib/persist";

// ---- Note model ----------------------------------------------------------
interface Note {
  id: string; rmName: string; leaderName: string; message: string;
  readAt: string | null; readBy: string | null; createdAt: string;
  targetType: string | null; targetId: string | null;
}
type NoteRow = {
  id: string; rm_name: string; leader_name: string; message: string;
  read_at: string | null; read_by: string | null; created_at: string;
  target_type: string | null; target_id: string | null;
};
const fromNote = (r: NoteRow): Note => ({
  id: r.id, rmName: r.rm_name, leaderName: r.leader_name, message: r.message,
  readAt: r.read_at, readBy: r.read_by, createdAt: r.created_at,
  targetType: r.target_type, targetId: r.target_id,
});

type CardKind = "activity" | "lead";
interface MixedCard {
  kind: CardKind;
  id: string;
  rm: string;
  sortTs: number;
  activity?: RmActivity;
  lead?: Lead;
}

export function ActivityDailyPage({
  extraActivities = [],
  leads = [],
  onAddActivity,
}: {
  extraActivities?: RmActivity[];
  leads?: Lead[];
  onAddActivity?: () => void;
} = {}) {
  const { user } = useAuth();
  const isLeader = user?.role === "leader";
  const isRM = user?.role === "rm";

  const teamRMs = useMemo<string[]>(() => {
    if (!user) return [];
    if (isLeader) return leaders.find((l) => l.name === user.name)?.rms ?? [];
    if (isRM) return [user.name];
    return [];
  }, [user, isLeader, isRM]);

  const leaderName = useMemo(() => {
    if (isLeader) return user!.name;
    if (isRM) return user!.leaderName ?? leaders.find((l) => l.rms.includes(user!.name))?.name ?? "";
    return "";
  }, [user, isLeader, isRM]);

  // KPI counters (today)
  const todayKey = new Date().toDateString();
  const extraToday = extraActivities.filter((a) => new Date(a.datetime).toDateString() === todayKey);
  const incFor = (rm: string) => {
    const list = extraToday.filter((a) => a.rm === rm);
    const bucket = { prospecting: 0, followUp: 0, meeting: 0, closing: 0 };
    list.forEach((a) => {
      const j = a.jenis.toLowerCase();
      if (j.includes("prospect")) bucket.prospecting += 1;
      else if (j.includes("follow") || j.includes("telepon") || j.includes("whatsapp")) bucket.followUp += 1;
      else if (j.includes("meet") || j.includes("kunjung") || j.includes("presentasi")) bucket.meeting += 1;
      else if (j.includes("closing")) bucket.closing += 1;
      else bucket.followUp += 1;
    });
    return bucket;
  };
  const visiblePics = picActivities.filter((p) => teamRMs.includes(p.pic)).map((p) => {
    const inc = incFor(p.pic);
    return {
      ...p,
      prospecting: p.prospecting + inc.prospecting,
      followUp: p.followUp + inc.followUp,
      meeting: p.meeting + inc.meeting,
      closing: p.closing + inc.closing,
    };
  });
  const scopeLabel = isLeader
    ? `Tim ${user!.name} · ${teamRMs.length} RM`
    : isRM
      ? `Hanya data Anda — ${user!.name}`
      : "Semua RM";

  const todayCounters = useMemo(() => {
    const c = { prospecting: 0, followUp: 0, appointment: 0 };
    extraToday.forEach((a) => {
      const j = a.jenis.toLowerCase();
      if (j.includes("prospect")) c.prospecting += 1;
      else if (j.includes("meet") || j.includes("kunjung") || j.includes("presentasi") || j.includes("appoint")) c.appointment += 1;
      else if (j.includes("follow") || j.includes("telepon") || j.includes("whatsapp") || j.includes("closing")) c.followUp += 1;
      else c.followUp += 1;
    });
    return c;
  }, [extraToday]);

  // ---- Notes state + realtime ---------------------------------------------
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.from("task_notes").select("*").order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) toast.error("Gagal memuat notes", { description: error.message });
      else setNotes((data ?? []).map((r) => fromNote(r as NoteRow)));
      setLoading(false);
    })();
    const ch = supabase
      .channel("notes_rt")
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
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);

  // ---- Build mixed cards per RM -------------------------------------------
  const cardsFor = (rm: string): MixedCard[] => {
    const acts = extraActivities.filter((a) => a.rm === rm).map<MixedCard>((a) => ({
      kind: "activity", id: a.id, rm, sortTs: new Date(a.createdAt || a.datetime).getTime(), activity: a,
    }));
    return acts.sort((a, b) => b.sortTs - a.sortTs);
  };

  const notesForCard = (kind: CardKind, id: string) =>
    notes.filter((n) => n.targetType === kind && n.targetId === id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // ---- Actions -------------------------------------------------------------
  const toggleActivityDone = async (a: RmActivity) => {
    if (!isRM || a.rm !== user?.name) return;
    const next = !a.done;
    try {
      await setActivityDone(a.id, next);
      // realtime will update via Index, but show feedback
    } catch (e) {
      toast.error("Gagal update", { description: e instanceof Error ? e.message : "Unknown" });
    }
  };

  const sendNote = async (kind: CardKind, targetId: string, rm: string, message: string) => {
    if (!isLeader || !user || !message.trim()) return;
    const optimistic: Note = {
      id: `tmp-${crypto.randomUUID()}`,
      rmName: rm, leaderName: user.name, message: message.trim(),
      readAt: null, readBy: null, createdAt: new Date().toISOString(),
      targetType: kind, targetId,
    };
    setNotes((prev) => [optimistic, ...prev]);
    const { data, error } = await supabase.from("task_notes").insert({
      rm_name: rm, leader_name: user.name, message: message.trim(),
      target_type: kind, target_id: targetId,
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
    }
  };

  // Per-RM activity progress (cards.activity only)
  const progressFor = (rm: string) => {
    const acts = extraActivities.filter((a) => a.rm === rm);
    const done = acts.filter((a) => a.done).length;
    return { done, total: acts.length, pct: acts.length === 0 ? 0 : Math.round((done / acts.length) * 100) };
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Prospecting Hari Ini" value={todayCounters.prospecting} hint="Kontak baru ditambahkan" icon={Phone} tone="blue" />
        <KpiCard title="Follow-Up Hari Ini" value={todayCounters.followUp} hint="Eksekusi pipeline FU1–FU3" icon={MessageSquare} tone="blue" />
        <KpiCard title="Appointment Hari Ini" value={todayCounters.appointment} hint="Meeting & kunjungan" icon={Calendar} tone="navy" />
      </div>

      {/* Task Board */}
      <section className="panel p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white shrink-0"><ListChecks className="h-4 w-4" /></div>
            <div>
              <h3 className="font-bold text-navy">Task Board — Activity</h3>
              <p className="text-xs text-muted-foreground">
                {loading ? "Memuat data dari Lovable Cloud…" : isLeader
                  ? "Pantau kartu Activity tiap RM. Tulis note di kartu mana pun — RM akan menandai 'Noted' saat dibaca."
                  : "Card aktivitas yang kamu input muncul di sini. Centang kartu yang sudah selesai."}
              </p>
            </div>
          </div>
          <StatusBadge tone="blue">{scopeLabel}</StatusBadge>
        </div>

        {/* Board */}
        {isRM ? (
          <div className="mt-4 space-y-3">
            {teamRMs.map((rm) => {
              const cards = cardsFor(rm);
              const { done, total, pct } = progressFor(rm);
              return (
                <RMColumn key={rm} rmName={rm} progress={pct} doneCount={done} totalCount={total} hasUnread={false} isLeaderView={false} dense>
                  {cards.length === 0 && <RichEmpty onAddActivity={onAddActivity} />}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((c) => (
                      <BoardCard
                        key={`${c.kind}-${c.id}`}
                        card={c}
                        notes={notesForCard(c.kind, c.id)}
                        isLeader={false}
                        isRM={true}
                        canCheck={c.kind === "activity" && c.activity?.rm === user?.name}
                        onToggleDone={() => c.activity && toggleActivityDone(c.activity)}
                        onSendNote={(msg) => sendNote(c.kind, c.id, rm, msg)}
                        currentLeader={leaderName}
                      />
                    ))}
                  </div>
                </RMColumn>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {teamRMs.map((rm) => {
              const cards = cardsFor(rm);
              const { done, total, pct } = progressFor(rm);
              const rmHasUnread = cards.some((c) =>
                notesForCard(c.kind, c.id).some((n) => !n.readAt)
              );
              return (
                <RMColumn key={rm} rmName={rm} progress={pct} doneCount={done} totalCount={total} hasUnread={rmHasUnread} isLeaderView={true}>
                  {cards.length === 0 && <Empty text="RM belum input activity atau lead." />}
                  {cards.map((c) => (
                    <BoardCard
                      key={`${c.kind}-${c.id}`}
                      card={c}
                      notes={notesForCard(c.kind, c.id)}
                      isLeader={true}
                      isRM={false}
                      canCheck={false}
                      onSendNote={(msg) => sendNote(c.kind, c.id, rm, msg)}
                      currentLeader={leaderName}
                    />
                  ))}
                </RMColumn>
              );
            })}
          </div>
        )}
      </section>

      {/* Monitoring Progress Tim (leader only) */}
      {isLeader && (
        <section className="panel p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0"><Crown className="h-4 w-4" /></div>
            <div>
              <h3 className="font-bold text-navy">Monitoring Progress Tim</h3>
              <p className="text-xs text-muted-foreground">Progress eksekusi activity harian per RM (centang di kartu activity).</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teamRMs.map((rm) => {
              const { done, total, pct } = progressFor(rm);
              return (
                <div key={rm} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-navy">{rm}</div>
                    <span className="text-xs text-muted-foreground">{done}/{total}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
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
          <StatusBadge tone="blue">{scopeLabel}</StatusBadge>
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
  rmName, progress, doneCount, totalCount, hasUnread, isLeaderView, children, dense,
}: {
  rmName: string; progress: number; doneCount: number; totalCount: number;
  hasUnread: boolean; isLeaderView: boolean; children: React.ReactNode; dense?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-muted/40 p-3 flex flex-col transition-colors",
      dense ? "" : "min-h-[220px]",
      hasUnread && isLeaderView ? "border-[hsl(var(--primary))] bg-primary-light/40" : "border-border"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-light text-primary">
          <UserRound className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-navy truncate">{rmName}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{doneCount}/{totalCount} activity selesai</div>
        </div>
      </div>
      <div className="mb-2 h-1.5 rounded-full bg-card overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-col gap-2 flex-1">{children}</div>
    </div>
  );
}

function hasilTone(h?: string): "blue" | "red" | "navy" {
  if (!h) return "navy";
  const v = h.toLowerCase();
  if (v.includes("ditolak")) return "red";
  return "blue";
}

function tempIcon(temp: "Hot" | "Warm" | "Cold") {
  if (temp === "Hot") return <Flame className="h-3 w-3" />;
  if (temp === "Warm") return <Thermometer className="h-3 w-3" />;
  return <Snowflake className="h-3 w-3" />;
}

function leadTemp(l: Lead): "Hot" | "Warm" | "Cold" {
  if (l.priority === "High") return "Hot";
  if (l.priority === "Medium") return "Warm";
  return "Cold";
}

function BoardCard({
  card, notes, isLeader, isRM, canCheck, onToggleDone, onSendNote, currentLeader,
}: {
  card: MixedCard;
  notes: Note[];
  isLeader: boolean;
  isRM: boolean;
  canCheck: boolean;
  onToggleDone?: () => void;
  onSendNote: (msg: string) => void;
  currentLeader: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-soft hover:shadow-card transition-shadow flex flex-col gap-2">
      {card.kind === "activity" && card.activity ? (
        <ActivityCardBody a={card.activity} canCheck={canCheck} onToggleDone={onToggleDone} />
      ) : card.lead ? (
        <LeadCardBody l={card.lead} />
      ) : null}

      <CardNotes notes={notes} isLeader={isLeader} isRM={isRM} rm={card.rm} onSend={onSendNote} currentLeader={currentLeader} />
    </div>
  );
}

function ActivityCardBody({ a, canCheck, onToggleDone }: { a: RmActivity; canCheck: boolean; onToggleDone?: () => void }) {
  return (
    <div className={cn(a.done && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge tone="navy">{a.jenis}</StatusBadge>
          {a.hasil && <StatusBadge tone={hasilTone(a.hasil)}>{a.hasil}</StatusBadge>}
        </div>
        {canCheck ? (
          <button onClick={onToggleDone} aria-label="Tandai selesai" className="shrink-0">
            <CheckCircle2 className={cn("h-5 w-5", a.done ? "text-primary" : "text-muted-foreground hover:text-primary")} />
          </button>
        ) : (
          <CheckCircle2 className={cn("h-5 w-5 shrink-0", a.done ? "text-primary" : "text-muted-foreground/40")} />
        )}
      </div>
      {a.leadName && (
        <div className="mt-1 text-[11px] text-muted-foreground">Lead: <span className="text-navy font-medium">{a.leadName}</span></div>
      )}
      <div className="mt-1 text-[11px] text-muted-foreground">
        {new Date(a.datetime).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className={cn("mt-1 text-[13px] text-navy break-words", a.done && "line-through text-muted-foreground")}>{a.description}</div>
      {a.photos && a.photos.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
            <ImageIcon className="h-3 w-3" /> {a.photos.length} foto
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {a.photos.map((p, i) => (
              <img key={i} src={p} alt="" className="h-12 w-12 object-cover rounded-md border border-border" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadCardBody({ l }: { l: Lead }) {
  const temp = leadTemp(l);
  const tempTone: "red" | "blue" = temp === "Hot" ? "red" : "blue";
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-navy">{l.nama}</div>
          <div className="text-[10px] text-muted-foreground">{l.id}</div>
        </div>
        <StatusBadge tone="navy">Lead</StatusBadge>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
        <StatusBadge tone="navy">{l.stage}</StatusBadge>
        <StatusBadge tone={tempTone}><span className="inline-flex items-center gap-1">{tempIcon(temp)} {temp}</span></StatusBadge>
        <StatusBadge tone={statusToTone(l.status)}>{l.status}</StatusBadge>
      </div>
      {l.produk && <div className="mt-1.5 text-[12px] text-navy">Produk: <span className="font-medium">{l.produk}</span></div>}
      {l.nextFollowUp && <div className="text-[11px] text-muted-foreground">FU berikutnya: {l.nextFollowUp}</div>}
    </div>
  );
}

function CardNotes({
  notes, isLeader, isRM, rm, onSend, currentLeader,
}: {
  notes: Note[]; isLeader: boolean; isRM: boolean; rm: string;
  onSend: (msg: string) => void; currentLeader: string;
}) {
  const [draft, setDraft] = useState("");
  if (notes.length === 0 && !isLeader) return null;
  return (
    <div className="mt-1 rounded-md border border-dashed border-border bg-muted/40 p-2 space-y-1.5">
      {notes.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-navy">
          <StickyNote className="h-3 w-3 text-primary" /> Note dari Leader
        </div>
      )}
      {notes.map((n) => (
        <div key={n.id} className={cn("rounded border p-1.5 text-[12px]", !n.readAt && isLeader ? "border-[hsl(var(--primary))] bg-primary-light/60" : "border-border bg-card")}>
          <div className="text-navy">{n.message}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {n.leaderName} · {new Date(n.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
          </div>
        </div>
      ))}
      {isLeader && (
        <div className="flex gap-1.5 pt-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { onSend(draft); setDraft(""); } }}
            placeholder={`Note untuk ${rm}…`}
            className="flex-1 h-7 px-2 text-[11px] rounded-md border border-input bg-background"
          />
          <Button
            size="sm"
            className="h-7 px-2 bg-navy hover:bg-navy/90 text-navy-foreground text-[11px]"
            onClick={() => { if (draft.trim()) { onSend(draft); setDraft(""); } }}
          >
            Kirim
          </Button>
        </div>
      )}
      {isRM && currentLeader && notes.length > 0 && (
        <div className="text-[10px] text-muted-foreground italic">Dari Leader — {currentLeader}</div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 p-3 text-[11px] text-muted-foreground text-center">{text}</div>
  );
}

function RichEmpty({ onAddActivity }: { onAddActivity?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[14px]" style={{ backgroundColor: "rgba(0,91,253,0.08)" }}>
        <ClipboardList className="h-7 w-7" style={{ color: "#005bfd" }} />
      </div>
      <div className="mt-4 text-sm font-semibold" style={{ color: "#1a2332" }}>Belum ada aktivitas hari ini</div>
      <div className="mt-1 text-[13px]" style={{ color: "#64748b" }}>Mulai catat prospecting atau follow-up pertamamu</div>
      {onAddActivity && (
        <button
          onClick={onAddActivity}
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0048d4]"
          style={{ backgroundColor: "#005bfd" }}
        >
          <Plus className="h-4 w-4" /> Tambah Activity
        </button>
      )}
    </div>
  );
}
