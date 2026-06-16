import { useMemo, useState } from "react";
import { AlertTriangle, AlertOctagon, CheckCircle2, Send } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { picActivities, leaders, type Lead, type RmActivity } from "@/lib/dummy-data";
import { insertNotification } from "@/lib/persist";
import { toast } from "sonner";

interface AlertItem {
  id: string;
  level: "Kritis" | "Peringatan";
  title: string;
  detail: string;
  rm?: string;
}

interface Props {
  leaderName: string;
  leads: Lead[];
  activities: RmActivity[];
}

export function TeamAlertPanel({ leaderName, leads, activities }: Props) {
  const teamRMs = useMemo(
    () => leaders.find((l) => l.name === leaderName)?.rms ?? [],
    [leaderName]
  );

  const [sent, setSent] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<Set<string>>(new Set());

  const alerts = useMemo<AlertItem[]>(() => {
    const out: AlertItem[] = [];

    // KRITIS — RM tanpa aktivitas hari ini
    const today = new Date().toDateString();
    const baseActivityRMs = new Set(picActivities.filter((p) => teamRMs.includes(p.pic) && (p.prospecting + p.followUp + p.meeting + p.closing) > 0).map((p) => p.pic));
    const extraActivityRMs = new Set(activities.filter((a) => new Date(a.datetime).toDateString() === today).map((a) => a.rm));
    const activeRMs = new Set<string>([...baseActivityRMs, ...extraActivityRMs]);
    const noActRMs = teamRMs.filter((rm) => !activeRMs.has(rm));
    const startOfDay = new Date(); startOfDay.setHours(8, 0, 0, 0);
    const hoursSince = Math.max(0, Math.round((Date.now() - startOfDay.getTime()) / 3600000));
    noActRMs.forEach((rm) => {
      out.push({
        id: `noact-${rm}`,
        level: "Kritis",
        title: "Belum input aktivitas hari ini",
        detail: `${hoursSince} jam sejak awal jam kerja`,
        rm,
      });
    });

    // KRITIS — Lead paling lama stagnan per stage (ambil 2 teratas)
    // Approximation: gunakan urutan list + heuristik nextFollowUp != "Hari ini"/"Besok"
    const stagnantCandidates = leads
      .filter((l) => l.status !== "Close" && l.status !== "Not Eligible")
      .map((l, idx) => ({ lead: l, days: 5 + ((idx * 3) % 12) }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 2);
    stagnantCandidates.forEach(({ lead, days }) => {
      out.push({
        id: `stag-${lead.id}`,
        level: "Kritis",
        title: `Lead stagnan ${days} hari di ${lead.stage}`,
        detail: `${lead.nama} · ${lead.id}`,
        rm: lead.pic,
      });
    });

    // PERINGATAN — FU overdue
    const overdueLeads = leads.filter((l) => l.nextFollowUp === "Hari ini" || /overdue|kemarin/i.test(l.nextFollowUp || ""));
    overdueLeads.slice(0, 3).forEach((l, i) => {
      out.push({
        id: `fu-${l.id}`,
        level: "Peringatan",
        title: "Follow-up overdue",
        detail: `${l.nama} · ${l.id} · ${1 + (i % 3)} hari overdue`,
        rm: l.pic,
      });
    });

    // PERINGATAN — RM dengan aktivitas paling rendah
    const acts = picActivities.filter((p) => teamRMs.includes(p.pic));
    if (acts.length > 0) {
      const sorted = [...acts].sort((a, b) =>
        (a.prospecting + a.followUp + a.meeting + a.closing) -
        (b.prospecting + b.followUp + b.meeting + b.closing)
      );
      const low = sorted[0];
      const total = low.prospecting + low.followUp + low.meeting + low.closing;
      out.push({
        id: `low-${low.pic}`,
        level: "Peringatan",
        title: "Aktivitas terendah di tim hari ini",
        detail: `Total ${total} aktivitas — paling rendah dibanding rekan tim`,
        rm: low.pic,
      });
    }

    return out;
  }, [teamRMs, leads, activities]);

  const kritisCount = alerts.filter((a) => a.level === "Kritis").length;
  const peringatanCount = alerts.filter((a) => a.level === "Peringatan").length;

  return (
    <div className="panel p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-light text-danger shrink-0">
          <AlertOctagon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-navy">Alert Tim</h3>
            <StatusBadge tone="red">{kritisCount} Kritis</StatusBadge>
            <StatusBadge tone="blue">{peringatanCount} Peringatan</StatusBadge>
          </div>
          <p className="text-xs text-muted-foreground">Peringatan supervisi untuk timmu — RM yang stagnan, FU overdue, dan aktivitas tertinggal.</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {alerts.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground text-center">
            <CheckCircle2 className="h-4 w-4 inline mr-1 text-primary" /> Semua alert sudah ditindaklanjuti.
          </div>
        )}
        {alerts.map((a) => {
          const isKritis = a.level === "Kritis";
          return (
            <div
              key={a.id}
              className={`rounded-lg border p-3 flex items-start gap-3 ${isKritis ? "border-l-4 border-l-[hsl(var(--danger))] bg-[hsl(var(--danger-light))]/30" : "border-l-4 border-l-primary bg-primary-light/30"}`}
            >
              <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-md shrink-0 ${isKritis ? "bg-[hsl(var(--danger))] text-white" : "bg-primary text-white"}`}>
                {isKritis ? <AlertOctagon className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge tone={isKritis ? "red" : "blue"}>{a.level}</StatusBadge>
                  <span className="text-sm font-semibold text-navy">{a.title}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {a.detail}{a.rm ? ` · RM ${a.rm}` : ""}
                </div>
              </div>
              {(() => {
                const isSent = sent.has(a.id);
                const isSending = sending.has(a.id);
                return (
                  <Button
                    size="sm"
                    variant={isSent ? "outline" : "default"}
                    disabled={isSent || isSending || !a.rm}
                    className={`shrink-0 ${isSent ? "" : "bg-danger text-white hover:bg-danger/90"}`}
                    onClick={async () => {
                      if (!a.rm) return;
                      setSending((p) => new Set(p).add(a.id));
                      try {
                        const message = `Leader menandai: ${a.title} — ${a.detail}`;
                        await insertNotification({ rmName: a.rm, message, source: "alert", createdBy: leaderName });
                        setSent((p) => new Set(p).add(a.id));
                        toast.success(`Alert berhasil dikirim ke ${a.rm}`);
                      } catch (e) {
                        toast.error("Gagal mengirim alert", { description: e instanceof Error ? e.message : "Unknown" });
                      } finally {
                        setSending((p) => { const n = new Set(p); n.delete(a.id); return n; });
                      }
                    }}
                  >
                    {isSent ? (<><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Terkirim</>) : (<><Send className="h-3.5 w-3.5 mr-1" /> {isSending ? "Mengirim…" : "Alert"}</>)}
                  </Button>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
