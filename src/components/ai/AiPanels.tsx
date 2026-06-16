import { useMemo, useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle, Bell, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { rankPriority, personalWarnings, type PriorityItem } from "@/lib/ai-sales";
import type { Lead } from "@/lib/dummy-data";

interface Props {
  leads: Lead[];
  onOpenLead?: (l: Lead) => void;
  onNavigatePipeline?: () => void;
}

export function AiPriorityToday({ leads, onOpenLead, onNavigatePipeline }: Props) {
  const items = useMemo(() => rankPriority(leads), [leads]);
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="panel p-5 border-l-4 border-l-primary">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary-light text-primary flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              Prioritas Hari Ini
              <StatusBadge tone="blue">Saran AI · perlu review</StatusBadge>
            </h3>
            <p className="text-xs text-muted-foreground">Diurutkan otomatis dari data temperature, stage, last activity & jadwal FU.</p>
          </div>
        </div>
        {onNavigatePipeline && (
          <Button variant="outline" size="sm" onClick={onNavigatePipeline}>Lihat semua lead</Button>
        )}
      </div>
      <ul className="divide-y divide-border">
        {items.map((it) => (
          <PriorityRow key={it.lead.id} item={it} open={openId === it.lead.id}
            onToggle={() => setOpenId(openId === it.lead.id ? null : it.lead.id)}
            onOpenLead={() => onOpenLead?.(it.lead)} />
        ))}
      </ul>
    </section>
  );
}

function PriorityRow({ item, open, onToggle, onOpenLead }: { item: PriorityItem; open: boolean; onToggle: () => void; onOpenLead: () => void }) {
  const l = item.lead;
  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0">
          <Flame className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onOpenLead} className="text-sm font-semibold text-navy hover:underline">{l.nama}</button>
            <span className="text-[11px] font-mono text-muted-foreground">{l.id}</span>
            <StatusBadge tone="navy">{l.stage}</StatusBadge>
            <StatusBadge tone={l.priority === "High" ? "red" : "blue"}>{l.priority}</StatusBadge>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.reasons.slice(0, 4).map((r) => (
              <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-navy">{r}</span>
            ))}
          </div>
          {open && (
            <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-navy">
              <div className="font-semibold flex items-center gap-1.5 mb-1"><Sparkles className="h-3 w-3 text-primary" /> Penjelasan AI</div>
              {item.explanation}
              <div className="mt-1 text-[11px] text-muted-foreground italic">Saran berdasarkan data — keputusan tetap di tangan Anda.</div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] text-muted-foreground">Skor {item.score}</span>
          <Button variant="ghost" size="sm" className="h-7 text-primary text-xs" onClick={onToggle}>
            {open ? <><ChevronUp className="h-3 w-3 mr-1" />Tutup</> : <><ChevronDown className="h-3 w-3 mr-1" />Kenapa ini prioritas?</>}
          </Button>
        </div>
      </div>
    </li>
  );
}

export function AiEarlyWarningPanel({ leads, onOpenLead }: { leads: Lead[]; onOpenLead?: (l: Lead) => void }) {
  const allLeads = leads;
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const items = useMemo(() => personalWarnings(allLeads).filter((w) => !dismissed.has(w.id)), [allLeads, dismissed]);

  if (items.length === 0) {
    return (
      <section className="panel p-5">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-navy">Early Warning Personal</h3>
          <StatusBadge tone="blue">Aman</StatusBadge>
        </div>
        <p className="text-xs text-muted-foreground">Tidak ada peringatan untuk lead Anda saat ini.</p>
      </section>
    );
  }

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-danger-light text-danger flex items-center justify-center">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              Early Warning Personal
              <StatusBadge tone="blue">Saran AI · perlu review</StatusBadge>
            </h3>
            <p className="text-xs text-muted-foreground">Pemantauan otomatis lead Anda — klik untuk membuka lead.</p>
          </div>
        </div>
      </div>
      <ul className="space-y-2">
        {items.slice(0, 8).map((w) => {
          const lead = allLeads.find((l) => l.id === w.leadId);
          const tone = w.level === "danger" ? "red" : "blue";
          return (
            <li key={w.id} className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30">
              <StatusBadge tone={tone} dot>{w.level === "danger" ? "Kritis" : w.level === "warning" ? "Peringatan" : "Info"}</StatusBadge>
              <div className="flex-1 min-w-0">
                <button className="text-sm font-medium text-navy hover:underline text-left" onClick={() => lead && onOpenLead?.(lead)}>{w.title}</button>
                <div className="text-xs text-muted-foreground">{w.detail}</div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground"
                onClick={() => setDismissed((p) => new Set(p).add(w.id))}>Tandai selesai</Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function useWarningCount(leads: Lead[]): number {
  return useMemo(() => personalWarnings(leads).length, [leads]);
}
