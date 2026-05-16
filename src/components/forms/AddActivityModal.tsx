import { useState } from "react";
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Lead, RmActivity } from "@/lib/dummy-data";

interface Props {
  rmName: string;
  leaderName: string;
  rmLeads: Lead[];
  onClose: () => void;
  onSave: (a: RmActivity) => void;
}

const activityTypes = ["Prospecting", "Follow-Up", "Meeting", "Presentasi", "Closing", "Kunjungan", "Telepon", "WhatsApp", "Lainnya"];
const hasilOpts = ["Positif", "Perlu Follow-Up", "Tidak Ada Respon", "Ditolak", "Closing"];

function toLocalDatetimeInput(d: Date) {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export function AddActivityModal({ rmName, leaderName, rmLeads, onClose, onSave }: Props) {
  const [jenis, setJenis] = useState(activityTypes[0]);
  const [leadId, setLeadId] = useState<string>("");
  const [datetime, setDatetime] = useState(toLocalDatetimeInput(new Date()));
  const [description, setDescription] = useState("");
  const [hasil, setHasil] = useState(hasilOpts[0]);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 3 - photos.length);
    const dataUrls = await Promise.all(arr.map((f) => new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(f);
    })));
    setPhotos((prev) => [...prev, ...dataUrls].slice(0, 3));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenis) { toast.error("Jenis aktivitas wajib"); return; }
    if (!datetime) { toast.error("Tanggal & waktu wajib"); return; }
    if (!description.trim()) { toast.error("Deskripsi aktivitas wajib"); return; }
    const lead = rmLeads.find((l) => l.id === leadId);
    const activity: RmActivity = {
      id: `ACT-${Date.now()}`,
      rm: rmName,
      leader: leaderName,
      jenis,
      leadId: lead?.id,
      leadName: lead?.nama,
      datetime: new Date(datetime).toISOString(),
      description: description.trim(),
      hasil,
      photos,
      createdAt: new Date().toISOString(),
    };
    onSave(activity);
    toast.success("Aktivitas tercatat", { description: `${jenis}${lead ? ` · ${lead.nama}` : ""}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-xl border-l border-border overflow-y-auto animate-fade-in">
        <div className="p-5 border-b border-border flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy">+ Tambah Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">RM: {rmName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4 text-sm">
          <Field label="Jenis Aktivitas *">
            <Select value={jenis} onChange={setJenis} options={activityTypes.map((s) => ({ v: s, label: s }))} />
          </Field>
          <Field label="Lead Terkait (opsional)">
            <Select value={leadId} onChange={setLeadId} options={[{ v: "", label: "— Aktivitas umum (tanpa lead) —" }, ...rmLeads.map((l) => ({ v: l.id, label: `${l.nama} · ${l.id}` }))]} />
          </Field>
          <Field label="Tanggal & Waktu Aktivitas *">
            <Input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} required />
          </Field>
          <Field label="Deskripsi Aktivitas *">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Apa yang terjadi, hasil pembicaraan, next step…" rows={4} required />
          </Field>
          <Field label="Hasil Aktivitas">
            <Select value={hasil} onChange={setHasil} options={hasilOpts.map((s) => ({ v: s, label: s }))} />
          </Field>
          <Field label="Upload Foto Bukti (opsional, maks 3)">
            <label className="flex items-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-3 py-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              <span>Pilih file gambar…</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={photos.length >= 3}
              />
            </label>
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative group rounded-md overflow-hidden border border-border">
                    <img src={src} alt={`bukti ${i + 1}`} className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-danger text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Hapus foto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length === 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ImageIcon className="h-3 w-3" /> Tidak ada foto dilampirkan
              </div>
            )}
          </Field>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
            <Button type="submit" className="flex-1 bg-[hsl(var(--gold))] text-navy hover:bg-[hsl(var(--gold))]/90 font-semibold">Simpan Activity</Button>
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
