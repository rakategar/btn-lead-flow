import { useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  Lead, PipelineStage, Priority, ResolutionStatus,
  Gender, Persona, CustomerStatus, Segmen, BusinessType, LeadGenType, ProductMix,
} from "@/lib/dummy-data";

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
const genders: Gender[] = ["Laki-laki", "Perempuan"];
const personas: Persona[] = ["Pengusaha", "Karyawan", "Pensiunan", "Executives"];
const custStatuses: { v: CustomerStatus; label: string }[] = [
  { v: "NTB", label: "NTB (Belum nasabah)" },
  { v: "Existing", label: "Existing (Sudah nasabah)" },
];
const segmens: Segmen[] = ["Retail", "Affluent", "HNWI"];
const bizTypes: BusinessType[] = ["B2C", "B2B"];
const leadGens: LeadGenType[] = ["Program", "Non Program"];
const productMixOpts: { v: ProductMix; label: string }[] = [
  { v: "MF", label: "MF · Mutual Fund" },
  { v: "Bonds", label: "Bonds" },
  { v: "Banca", label: "Banca · Bancassurance" },
  { v: "Casa", label: "Casa" },
  { v: "TD", label: "TD · Time Deposit" },
];

const fmtRp = (n: number) => n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "";
const parseRp = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const monthLabel = (d: Date) => d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
const weekOfMonth = (d: Date) => Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7);

export function AddLeadModal({ rmName, leaderName, existingCount, onClose, onSave }: Props) {
  const [nama, setNama] = useState("");
  const [stage, setStage] = useState<PipelineStage>("Contact");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [source, setSource] = useState(sources[0]);
  const [produk, setProduk] = useState(products[0]);
  const [ringkasan, setRingkasan] = useState("");
  const [fuDate, setFuDate] = useState("");
  const [status, setStatus] = useState<ResolutionStatus>("In Progress");
  // Data diri
  const [usia, setUsia] = useState<string>("");
  const [gender, setGender] = useState<Gender>("Laki-laki");
  // Profil
  const [persona, setPersona] = useState<Persona>("Karyawan");
  const [custStatus, setCustStatus] = useState<CustomerStatus>("NTB");
  const [segmen, setSegmen] = useState<Segmen>("Retail");
  const [bizType, setBizType] = useState<BusinessType>("B2C");
  // Program
  const [leadGen, setLeadGen] = useState<LeadGenType>("Non Program");
  const [productMix, setProductMix] = useState<ProductMix[]>([]);
  // Target
  const [plan, setPlan] = useState<number>(0);
  const [actual, setActual] = useState<number>(0);
  // Catatan
  const [remark, setRemark] = useState("");
  const [toBeImproved, setToBeImproved] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const touch = useCallback((field: string) => setTouched((t) => ({ ...t, [field]: true })), []);

  const errors: Record<string, string> = {};
  if (!nama.trim()) errors.nama = "Nama lead wajib diisi";
  if (nama.trim().length > 0 && nama.trim().length < 2) errors.nama = "Nama minimal 2 karakter";
  if (usia && (Number(usia) < 17 || Number(usia) > 100)) errors.usia = "Usia tidak valid (17–100)";
  if (plan < 0) errors.plan = "Nominal tidak boleh negatif";
  if (actual < 0) errors.actual = "Nominal tidak boleh negatif";

  const hasErrors = Object.keys(errors).length > 0;

  const toggleMix = (v: ProductMix) =>
    setProductMix((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nama: true, usia: true, plan: true, actual: true });
    if (hasErrors) { toast.error("Mohon perbaiki kesalahan pada form"); return; }
    const id = `LD-${String(existingCount + 100).padStart(3, "0")}`;
    const today = new Date();
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
      extras: {
        usia: usia ? Number(usia) : undefined,
        gender,
        persona,
        customerStatus: custStatus,
        segmen,
        businessType: bizType,
        leadGen,
        productMix,
        plan,
        actual,
        remark: remark.trim() || undefined,
        toBeImproved: toBeImproved.trim() || undefined,
        inputDate: today.toISOString(),
        bulan: monthLabel(today),
        minggu: weekOfMonth(today),
      },
    };
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 300)); // slight UX delay for feedback
      onSave(lead);
      toast.success("Lead baru ditambahkan", { description: `${lead.nama} · ${lead.produk}` });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-lg bg-card shadow-xl border-l border-border flex flex-col animate-fade-in">
        <div className="p-5 border-b border-border flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy">+ Tambah Lead</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Pemilik otomatis: {rmName} · Leader: {leaderName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            <Section title="Data Nasabah">
              <ValidatedField label="Nama Lead *" error={touched.nama ? errors.nama : undefined} valid={touched.nama && !errors.nama && nama.length > 0}>
                <Input
                  value={nama}
                  onChange={(e) => { setNama(e.target.value); touch("nama"); }}
                  onBlur={() => touch("nama")}
                  placeholder="Nama nasabah"
                  maxLength={100}
                  aria-invalid={touched.nama && !!errors.nama}
                  aria-describedby={errors.nama ? "nama-error" : undefined}
                  className={cn(touched.nama && errors.nama && "border-[hsl(var(--danger))] focus-visible:ring-[hsl(var(--danger))]/30", touched.nama && !errors.nama && nama && "border-[hsl(var(--success))]")}
                />
              </ValidatedField>
              <div className="grid grid-cols-2 gap-3">
                <ValidatedField label="Usia (tahun)" error={touched.usia ? errors.usia : undefined}>
                  <Input
                    type="number" min={17} max={100}
                    value={usia}
                    onChange={(e) => { setUsia(e.target.value); touch("usia"); }}
                    onBlur={() => touch("usia")}
                    placeholder="cth. 35"
                    className={cn(touched.usia && errors.usia && "border-[hsl(var(--danger))]")}
                  />
                </ValidatedField>
                <Field label="Jenis Kelamin">
                  <Select value={gender} onChange={(v) => setGender(v as Gender)} options={genders.map((g) => ({ v: g, label: g }))} />
                </Field>
              </div>
            </Section>

            <Section title="Profil & Segmen">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Persona">
                  <Select value={persona} onChange={(v) => setPersona(v as Persona)} options={personas.map((p) => ({ v: p, label: p }))} />
                </Field>
                <Field label="Status Nasabah">
                  <Select value={custStatus} onChange={(v) => setCustStatus(v as CustomerStatus)} options={custStatuses} />
                </Field>
                <Field label="Segmen">
                  <Select value={segmen} onChange={(v) => setSegmen(v as Segmen)} options={segmens.map((s) => ({ v: s, label: s }))} />
                </Field>
                <Field label="Tipe Bisnis">
                  <Select value={bizType} onChange={(v) => setBizType(v as BusinessType)} options={bizTypes.map((b) => ({ v: b, label: b }))} />
                </Field>
              </div>
            </Section>

            <Section title="Pipeline & Follow-Up">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stage Pipeline *">
                  <Select value={stage} onChange={(v) => setStage(v as PipelineStage)} options={stages.map((s) => ({ v: s, label: s }))} />
                </Field>
                <Field label="Status / Temperature *">
                  <Select value={priority} onChange={(v) => setPriority(v as Priority)} options={priorities.map((p) => ({ v: p.v, label: p.label }))} />
                </Field>
                <Field label="Progress">
                  <Select value={status} onChange={(v) => setStatus(v as ResolutionStatus)} options={progressOpts.map((p) => ({ v: p, label: p }))} />
                </Field>
                <Field label={<>Jadwal Follow-Up <span className="text-[#ff0000]">*</span></>}>
                  <Input type="date" value={fuDate} onChange={(e) => setFuDate(e.target.value)} placeholder="dd/mm/yyyy" />
                </Field>
              </div>
            </Section>

            <Section title="Produk & Program">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sumber Lead">
                  <Select value={source} onChange={setSource} options={sources.map((s) => ({ v: s, label: s }))} />
                </Field>
                <Field label="Minat Produk">
                  <Select value={produk} onChange={setProduk} options={products.map((p) => ({ v: p, label: p }))} />
                </Field>
                <Field label="Lead Generation">
                  <Select value={leadGen} onChange={(v) => setLeadGen(v as LeadGenType)} options={leadGens.map((l) => ({ v: l, label: l }))} />
                </Field>
              </div>
              <Field label="Product Mix (pilih satu atau lebih)">
                <div className="flex flex-wrap gap-2">
                  {productMixOpts.map((o) => {
                    const active = productMix.includes(o.v);
                    return (
                      <button
                        type="button"
                        key={o.v}
                        onClick={() => toggleMix(o.v)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          active
                            ? "bg-navy text-navy-foreground border-navy"
                            : "bg-card text-muted-foreground border-border hover:border-navy/40"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </Section>

            <Section title="Target & Realisasi">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Plan (Target Nominal)">
                  <Input
                    inputMode="numeric"
                    value={plan ? fmtRp(plan) : ""}
                    onChange={(e) => setPlan(parseRp(e.target.value))}
                    placeholder="Rp 0"
                  />
                </Field>
                <Field label="Actual (Realisasi)">
                  <Input
                    inputMode="numeric"
                    value={actual ? fmtRp(actual) : ""}
                    onChange={(e) => setActual(parseRp(e.target.value))}
                    placeholder="Rp 0"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Catatan">
              <Field label="Ringkasan Kebutuhan">
                <Textarea value={ringkasan} onChange={(e) => setRingkasan(e.target.value)} placeholder="Deskripsikan kebutuhan & ekspektasi nasabah" rows={3} maxLength={1000} />
              </Field>
              <Field label="Remark">
                <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Catatan situasi / kondisi khusus nasabah" rows={2} maxLength={1000} />
              </Field>
              <Field label="To Be Improved">
                <Textarea value={toBeImproved} onChange={(e) => setToBeImproved(e.target.value)} placeholder="Apa yang perlu diperbaiki dari pendekatan ke nasabah ini" rows={2} maxLength={1000} />
              </Field>
            </Section>
          </div>

          <div className="p-4 border-t border-border bg-card relative">
            <div className="absolute -top-10 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-card to-transparent" />
            {hasErrors && Object.values(touched).some(Boolean) && (
              <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-[hsl(var(--danger-light))] border border-[hsl(var(--danger))]/20 text-xs text-[hsl(var(--danger))]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Mohon perbaiki {Object.keys(errors).length} kesalahan pada form sebelum menyimpan.</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 h-12 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-medium hover:bg-[#f4f6f9] transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                aria-label="Simpan lead baru"
                className="flex-1 h-12 rounded-lg bg-[#005bfd] text-white text-sm font-semibold hover:bg-[#0048d4] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? (
                  <span className="animate-pulse">Menyimpan…</span>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Simpan Lead</>
                )}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-wider font-bold text-primary">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-navy block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ValidatedField({ label, children, error, valid }: { label: string; children: React.ReactNode; error?: string; valid?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-navy">{label}</label>
        {valid && <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" aria-hidden="true" />}
        {error && <AlertCircle className="h-3.5 w-3.5 text-[hsl(var(--danger))]" aria-hidden="true" />}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-[hsl(var(--danger))] flex items-center gap-1" role="alert" id={`${label.toLowerCase().replace(/\s+/g,"-")}-error`}>
          {error}
        </p>
      )}
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
