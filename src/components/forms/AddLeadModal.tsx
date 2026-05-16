import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Lead, PipelineStage, Priority, ResolutionStatus } from "@/lib/dummy-data";

interface Props {
  rmName: string;
  leaderName: string;
  existingCount: number;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

const stages: PipelineStage[] = ["Contact", "Meet", "Prospect", "Close"];
const priorities: { v: Priority; label: string }[] = [
  { v: "High", label: "Hot" },
  { v: "Medium", label: "Warm" },
  { v: "Low", label: "Cold" },
];
const sources = ["Referral Cabang", "Program", "Event", "Digital", "Walk-in", "Lainnya"];
const products = ["KPR", "Tabungan", "Deposito", "Bancassurance", "KTA", "SME", "Lainnya"];
const progressOpts: ResolutionStatus[] = ["In Progress", "Follow Up", "Close", "Not Eligible"];

export function AddLeadModal({ rmName, leaderName, existingCount, onClose, onSave }: Props) {
  const [nama, setNama] = useState("");
  const [stage, setStage] = useState<PipelineStage>("Contact");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [source, setSource] = useState(sources[0]);
  const [produk, setProduk] = useState(products[0]);
  const [ringkasan, setRingkasan] = useState("");
  const [fuDate, setFuDate] = useState("");
  const [status, setStatus] = useState<ResolutionStatus>("In Progress");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) { toast.error("Nama lead wajib diisi"); return; }
    const id = `LD-${String(existingCount + 100).padStart(3, "0")}`;
    const lead: Lead = {
      id,
      nama: nama.trim(),
      stage,
      priority,
      pic: rmName,
      leader: leaderName,
      source,
      produk,
      lastActivity: "Lead baru ditambahkan",
      nextFollowUp: fuDate ? new Date(fuDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) : "Belum dijadwalkan",
      fuStage: "FU1",
      status,
      ringkasan: ringkasan.trim() || "—",
    };
    onSave(lead);
    toast.success("Lead baru ditambahkan", { description: `${lead.nama} · ${lead.produk}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-xl border-l border-border overflow-y-auto animate-fade-in">
        <div className="p-5 border-b border-border flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy">+ Tambah Lead</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Pemilik otomatis: {rmName} · Leader: {leaderName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4 text-sm">
          <Field label="Nama Lead *">
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama nasabah" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stage Pipeline *">
              <Select value={stage} onChange={(v) => setStage(v as PipelineStage)} options={stages.map((s) => ({ v: s, label: s }))} />
            </Field>
            <Field label="Status / Temperature *">
              <Select value={priority} onChange={(v) => setPriority(v as Priority)} options={priorities.map((p) => ({ v: p.v, label: p.label }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sumber Lead">
              <Select value={source} onChange={setSource} options={sources.map((s) => ({ v: s, label: s }))} />
            </Field>
            <Field label="Minat Produk">
              <Select value={produk} onChange={setProduk} options={products.map((p) => ({ v: p, label: p }))} />
            </Field>
          </div>
          <Field label="Ringkasan Kebutuhan">
            <Textarea value={ringkasan} onChange={(e) => setRingkasan(e.target.value)} placeholder="Deskripsikan kebutuhan & ekspektasi nasabah" rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jadwal Follow-Up">
              <Input type="date" value={fuDate} onChange={(e) => setFuDate(e.target.value)} />
            </Field>
            <Field label="Progress">
              <Select value={status} onChange={(v) => setStatus(v as ResolutionStatus)} options={progressOpts.map((p) => ({ v: p, label: p }))} />
            </Field>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
            <Button type="submit" className="flex-1 bg-navy hover:bg-navy/90 text-navy-foreground">Simpan Lead</Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-navy block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
    </select>
  );
}
