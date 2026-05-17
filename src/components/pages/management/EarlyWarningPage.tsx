import { useState } from "react";
import { AlertOctagon, AlertTriangle, Eye, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { mgmtAlerts, type AlertLevel } from "@/lib/dummy-data";
import { PageHero, PanelHeader } from "./_shared";

const levels: { key: AlertLevel; title: string; tone: string; icon: any; border: string }[] = [
  { key: "Critical", title: "Critical · Aksi Segera",   tone: "red",    icon: AlertOctagon,   border: "border-l-danger" },
  { key: "Warning",  title: "Warning · Perhatikan",      tone: "orange", icon: AlertTriangle,  border: "border-l-accent" },
  { key: "Watch",    title: "Watch · Pantau",            tone: "blue",   icon: Eye,            border: "border-l-primary" },
];

export function EarlyWarningPage() {
  const [tab, setTab] = useState<"open" | "resolved">("open");
  const items = mgmtAlerts.filter((a) => (tab === "open" ? !a.resolved : a.resolved));
  const [sheet, setSheet] = useState<{ alertId: string; title: string; target: string; mode: "delegasi" | "eskalasi" } | null>(null);
  const [note, setNote] = useState("");

  const openSheet = (mode: "delegasi" | "eskalasi", alert: typeof mgmtAlerts[number]) => {
    const target = mode === "delegasi"
      ? (alert.pic ? `${alert.pic} (${alert.branch})` : `Leader ${alert.branch}`)
      : `Senior Leader · ${alert.branch}`;
    setSheet({ alertId: alert.id, title: alert.title, target, mode });
    setNote("");
  };

  const sendNote = () => {
    if (!sheet) return;
    if (!note.trim()) {
      toast.error("Note tidak boleh kosong");
      return;
    }
    const label = sheet.mode === "delegasi" ? "Delegasi" : "Eskalasi";
    toast.success(`${label} terkirim ke ${sheet.target}`, { description: sheet.title });
    setSheet(null);
    setNote("");
  };

  return (
    <div className="space-y-5">
      <PageHero title="Early Warning System" subtitle="Pantau alert kritis, peringatan, dan pengawasan lintas cabang." />

      <div className="flex items-center gap-2">
        <Chip active={tab === "open"} onClick={() => setTab("open")}>Open ({mgmtAlerts.filter((a) => !a.resolved).length})</Chip>
        <Chip active={tab === "resolved"} onClick={() => setTab("resolved")}>Resolved ({mgmtAlerts.filter((a) => a.resolved).length})</Chip>
      </div>

      {levels.map((lvl) => {
        const Icon = lvl.icon;
        const list = items.filter((a) => a.level === lvl.key);
        return (
          <section key={lvl.key} className={cn("panel p-5 border-l-4", lvl.border)}>
            <PanelHeader title={lvl.title} caption={`${list.length} alert`} icon={Icon} />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {list.length === 0 && <div className="text-sm text-muted-foreground italic">Tidak ada alert pada level ini.</div>}
              {list.map((a) => (
                <div key={a.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge tone={lvl.tone as any}>{a.level}</StatusBadge>
                        <span className="text-[11px] text-muted-foreground">{a.ageDays} hari</span>
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-navy">{a.title}</div>
                      <div className="text-[11px] text-muted-foreground">{a.branch}{a.pic ? ` · ${a.pic}` : ""}</div>
                    </div>
                    {a.resolved && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                  </div>
                  {!a.resolved && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="bg-navy hover:bg-navy/90 text-navy-foreground" onClick={() => openSheet("delegasi", a)}>Delegasi</Button>
                      <Button size="sm" variant="outline" onClick={() => openSheet("eskalasi", a)}><ArrowUpRight className="h-3.5 w-3.5 mr-1" />Eskalasi</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <Sheet open={!!sheet} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{sheet?.mode === "delegasi" ? "Delegasi Tindak Lanjut" : "Eskalasi Alert"}</SheetTitle>
            <SheetDescription>
              {sheet?.title}
              <div className="mt-1 text-xs">Tujuan: <span className="font-semibold text-navy">{sheet?.target}</span></div>
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <Label htmlFor="alert-note">Note</Label>
            <Textarea
              id="alert-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={sheet?.mode === "delegasi"
                ? "Tulis instruksi tindak lanjut untuk penerima delegasi…"
                : "Tulis konteks dan urgensi untuk eskalasi…"}
              rows={6}
            />
          </div>
          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setSheet(null)}>Batal</Button>
            <Button className="bg-navy hover:bg-navy/90 text-navy-foreground" onClick={sendNote}>Kirim</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors", active ? "bg-navy text-navy-foreground border-navy" : "bg-card text-muted-foreground border-border hover:border-navy/40")}>{children}</button>
  );
}
