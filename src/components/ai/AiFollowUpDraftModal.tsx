import { useState } from "react";
import { Sparkles, Loader2, ShieldAlert, Wand2, Copy, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { checkCompliance, type ComplianceIssue } from "@/lib/ai-sales";
import type { Lead } from "@/lib/dummy-data";
import { toast } from "sonner";

interface Props {
  lead: Lead;
  rmName?: string;
  onClose: () => void;
}

export function AiFollowUpDraftModal({ lead, rmName, onClose }: Props) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [editing, setEditing] = useState(false);

  const callFn = async (mode: "generate" | "rewrite", currentDraft?: string, currentIssues?: ComplianceIssue[]) => {
    const setBusy = mode === "rewrite" ? setRewriting : setLoading;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-sales-assistant", {
        body: {
          mode,
          nama: lead.nama, produk: lead.produk, stage: lead.stage, priority: lead.priority,
          fuStage: lead.fuStage, lastActivity: lead.lastActivity, ringkasan: lead.ringkasan,
          rmName, draft: currentDraft, issues: currentIssues,
        },
      });
      if (error) throw error;
      const text = (data as any)?.draft as string;
      setDraft(text);
      setIssues(checkCompliance(text));
      if ((data as any)?.fallback) toast.info("AI menggunakan template fallback (gateway tidak tersedia).");
    } catch (e: any) {
      toast.error("Gagal generate draft", { description: e.message });
    } finally { setBusy(false); }
  };

  const onChangeDraft = (v: string) => {
    setDraft(v);
    setIssues(checkCompliance(v));
  };

  const copyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    toast.success("Draft disalin ke clipboard");
  };

  const blocked = issues.length > 0 && !editing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card rounded-xl shadow-xl border border-border max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-border flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[hsl(var(--gold))]" />
              <h3 className="text-base font-bold text-navy">AI Follow-Up Generator</h3>
              <StatusBadge tone="gold">Saran AI · perlu review</StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lead.nama} · {lead.produk} · {lead.stage} · {lead.fuStage}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {!draft && (
            <div className="rounded-lg bg-muted/40 p-4 text-sm text-navy">
              <p>AI akan membaca data lead ini (nama, produk, stage, catatan, tahap FU) lalu menulis draft pesan follow-up.</p>
              <Button onClick={() => callFn("generate")} disabled={loading} className="mt-3 bg-[hsl(var(--gold))] text-navy hover:bg-[hsl(var(--gold))]/90">
                {loading ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Membuat draft…</> : <><Wand2 className="h-4 w-4 mr-1.5" />Generate Draft dengan AI</>}
              </Button>
            </div>
          )}

          {draft && (
            <>
              <div className="text-xs font-semibold text-navy">Draft pesan</div>
              <div className="rounded-md border border-input bg-background p-1">
                <Textarea value={draft} onChange={(e) => onChangeDraft(e.target.value)} className="min-h-[200px] border-0 focus-visible:ring-0" />
              </div>
              <p className="text-[11px] text-muted-foreground italic">Draft ini perlu kamu review sebelum dikirim. AI tidak mengirim pesan apa pun.</p>

              {issues.length > 0 ? (
                <div className="rounded-lg border border-danger/40 bg-danger-light/40 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-danger font-semibold text-sm">
                    <ShieldAlert className="h-4 w-4" /> Compliance warning — draft ini belum boleh digunakan
                  </div>
                  <ul className="text-xs space-y-1.5">
                    {issues.map((i, idx) => (
                      <li key={idx} className="text-navy">
                        <span className="bg-danger/20 px-1 rounded font-mono">{i.phrase}</span> — {i.reason}
                        <div className="text-muted-foreground">Saran: {i.suggestion}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => callFn("rewrite", draft, issues)} disabled={rewriting} className="bg-danger hover:bg-danger/90 text-white">
                      {rewriting ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Memperbaiki…</> : <><Wand2 className="h-3.5 w-3.5 mr-1.5" />Perbaiki Draft</>}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit Manual</Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-success/40 bg-success-light/40 p-3 flex items-center gap-2 text-success text-sm">
                  <CheckCircle2 className="h-4 w-4" /> Tidak ada issue compliance terdeteksi.
                </div>
              )}
            </>
          )}
        </div>

        {draft && (
          <div className="p-4 border-t border-border flex flex-wrap gap-2 justify-end bg-muted/30">
            <Button variant="outline" onClick={() => callFn("generate")} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-1.5" />Buat Ulang
            </Button>
            <Button variant="outline" onClick={() => setEditing(true)} disabled={editing}>Edit Dulu</Button>
            <Button onClick={copyDraft} disabled={blocked} className="bg-primary">
              <Copy className="h-4 w-4 mr-1.5" />Gunakan Draft Ini
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
