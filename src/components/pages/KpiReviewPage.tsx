import { useEffect, useState } from "react";
import { CalendarDays, CalendarClock, Trophy, BadgeDollarSign, Heart, TrendingUp, Crown, CheckCircle2, Plus, Trash2, Pencil, Check, X, Lock } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { resultArea } from "@/lib/dummy-data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RhythmType = "weekly" | "monthly";
interface Rhythm { id: string; type: RhythmType; label: string; position: number }

const alignment = [
  { label: "Sales Team Status", value: "On Track", tone: "green" as const },
  { label: "Sales Leader Review", value: "Mingguan terjadwal", tone: "blue" as const },
  { label: "Gap Alignment", value: "2 area perlu sinkronisasi", tone: "orange" as const },
  { label: "Next Coaching Focus", value: "Closing & objection handling", tone: "gold" as const },
];

const resultIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Revenue: BadgeDollarSign,
  Engagement: Heart,
  "Sales Growth": TrendingUp,
  Leadership: Crown,
};

export function KpiReviewPage() {
  const { user } = useAuth();
  const isLeader = user?.role === "leader";
  const [rhythms, setRhythms] = useState<Rhythm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("rhythms")
        .select("*")
        .order("type", { ascending: true })
        .order("position", { ascending: true });
      if (!mounted) return;
      if (error) toast.error("Gagal memuat rhythms", { description: error.message });
      else setRhythms((data ?? []) as Rhythm[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel("rhythms_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "rhythms" }, (payload) => {
        setRhythms((prev) => {
          if (payload.eventType === "INSERT") {
            const r = payload.new as Rhythm;
            if (prev.some((x) => x.id === r.id)) return prev;
            return [...prev, r].sort((a, b) => a.type.localeCompare(b.type) || a.position - b.position);
          }
          if (payload.eventType === "UPDATE") {
            const r = payload.new as Rhythm;
            return prev.map((x) => (x.id === r.id ? r : x));
          }
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id: string }).id;
            return prev.filter((x) => x.id !== oldId);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const weekly = rhythms.filter((r) => r.type === "weekly");
  const monthly = rhythms.filter((r) => r.type === "monthly");

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <RhythmCard
          title="Weekly Rhythm"
          caption="Eksekusi mingguan untuk menutup gap aktivitas."
          icon={CalendarDays}
          type="weekly"
          items={weekly}
          canEdit={!!isLeader}
          loading={loading}
        />
        <RhythmCard
          title="Monthly Rhythm"
          caption="Evaluasi bulanan dan rencana remedial."
          icon={CalendarClock}
          type="monthly"
          items={monthly}
          canEdit={!!isLeader}
          loading={loading}
        />
      </div>

      {/* Alignment */}
      <section>
        <Head title="Alignment Management" caption="Sinkronisasi antara Sales Team dan Sales Leader." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {alignment.map((a) => (
            <div key={a.label} className="panel p-4">
              <div className="text-xs text-muted-foreground">{a.label}</div>
              <div className="mt-2"><StatusBadge tone={a.tone}>{a.value}</StatusBadge></div>
            </div>
          ))}
        </div>
      </section>

      {/* Result */}
      <section>
        <Head title="Result Area" caption="Empat area hasil yang dipantau dari kerangka A.C.T." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resultArea.map((r) => {
            const Icon = resultIcons[r.name] ?? Trophy;
            return (
              <div key={r.name} className="panel p-5 bg-gradient-to-br from-card to-gold-light/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-gold"><Icon className="h-5 w-5" /></div>
                  <div className="text-sm font-semibold text-navy">{r.name}</div>
                </div>
                <div className="mt-3 text-2xl font-extrabold text-navy">{r.value}</div>
                <div className="text-xs text-muted-foreground">{r.caption}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="panel p-4 text-xs text-muted-foreground border-l-4 border-l-[hsl(var(--gold))]">
        <span className="font-semibold text-navy">Catatan:</span> Nilai pada halaman ini adalah dummy untuk kebutuhan presentasi konsep.
        Kerangka A.C.T menjaga konsistensi dari aktivitas harian hingga area hasil.
      </div>
    </div>
  );
}

function Head({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-bold text-navy">{title}</h3>
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

function RhythmCard({
  title, caption, icon: Icon, type, items, canEdit, loading,
}: {
  title: string; caption: string; icon: React.ComponentType<{ className?: string }>;
  type: RhythmType; items: Rhythm[]; canEdit: boolean; loading: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const add = async () => {
    const label = draft.trim();
    if (!label) return;
    setDraft("");
    const nextPos = (items[items.length - 1]?.position ?? 0) + 1;
    const { error } = await supabase.from("rhythms").insert({ type, label, position: nextPos });
    if (error) toast.error("Gagal menambah", { description: error.message });
  };

  const save = async (id: string) => {
    const label = editingValue.trim();
    if (!label) return;
    setEditingId(null);
    const { error } = await supabase.from("rhythms").update({ label }).eq("id", id);
    if (error) toast.error("Gagal update", { description: error.message });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("rhythms").delete().eq("id", id);
    if (error) toast.error("Gagal hapus", { description: error.message });
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary"><Icon className="h-5 w-5" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-navy">{title}</h4>
            {!canEdit && <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground"><Lock className="h-3 w-3" />Read-only</span>}
          </div>
          <p className="text-xs text-muted-foreground">{caption}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {loading && <li className="text-xs text-muted-foreground">Memuat…</li>}
        {!loading && items.length === 0 && <li className="text-xs text-muted-foreground">Belum ada item.</li>}
        {items.map((it) => (
          <li key={it.id} className="group flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
            {editingId === it.id ? (
              <div className="flex-1 flex items-center gap-1">
                <input
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save(it.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 h-7 px-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
                <button onClick={() => save(it.id)} className="p-1 rounded hover:bg-success-light text-success" aria-label="Simpan"><Check className="h-3.5 w-3.5" /></button>
                <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-muted text-muted-foreground" aria-label="Batal"><X className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <>
                <span className="text-navy flex-1">{it.label}</span>
                {canEdit && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button onClick={() => { setEditingId(it.id); setEditingValue(it.label); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-navy" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => remove(it.id)} className="p-1 rounded hover:bg-danger-light text-muted-foreground hover:text-danger" aria-label="Hapus"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {canEdit && (
        <div className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={`Tambah ${type === "weekly" ? "weekly" : "monthly"} rhythm…`}
            className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <Button onClick={add} size="sm" className="bg-navy hover:bg-navy/90 text-navy-foreground"><Plus className="h-4 w-4 mr-1" />Tambah</Button>
        </div>
      )}
    </div>
  );
}
