import { User, MapPin, Building2, Tag, Phone, ShieldCheck, Plus, Bell, FilePlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { customerInteraksi } from "@/lib/dummy-data";

const minat = ["KPR Rumah Pertama", "Asuransi terkait KPR", "Tabungan BTN Batara", "Simulasi cicilan"];
const tindakLanjut = [
  "Jadwalkan call kedua",
  "Kirim simulasi KPR",
  "Cek kelengkapan dokumen",
  "Follow-up cabang KC Bekasi",
];

export function CustomerPage() {
  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xl shrink-0">
            AP
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-navy">Andi Pratama</h2>
              <StatusBadge tone="green" dot>Aktif Follow-up</StatusBadge>
              <StatusBadge tone="blue">Retail / KPR Prospektif</StatusBadge>
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div><div className="text-muted-foreground">Channel masuk</div><div className="font-medium text-navy">balé Properti</div></div>
              <div><div className="text-muted-foreground">Cabang relasi</div><div className="font-medium text-navy">KC Bekasi</div></div>
              <div><div className="text-muted-foreground">PIC officer</div><div className="font-medium text-navy">Rina A.</div></div>
              <div><div className="text-muted-foreground">Consent komunikasi</div><div className="font-medium text-success">Disetujui</div></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch md:w-44">
            <Button size="sm" className="bg-primary"><RefreshCw className="h-4 w-4 mr-1.5" />Update Status</Button>
            <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1.5" />Tambah Catatan</Button>
            <Button size="sm" variant="outline"><Bell className="h-4 w-4 mr-1.5" />Buat Reminder</Button>
            <Button size="sm" variant="outline"><FilePlus className="h-4 w-4 mr-1.5" />Buat Case</Button>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
          Data pada demo ini adalah data dummy dan hanya menunjukkan konsep tampilan Customer 360.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* Profil Ringkas */}
        <div className="panel p-5">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><h3 className="font-semibold text-navy">Profil Ringkas</h3></div>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row icon={User} label="Nama" value="Andi Pratama" />
            <Row icon={MapPin} label="Kota" value="Bekasi" />
            <Row icon={Tag} label="Channel asal" value="balé Properti" />
            <Row icon={ShieldCheck} label="Segmentasi" value="Retail / KPR Prospektif" />
            <Row icon={Building2} label="Cabang" value="KC Bekasi" />
            <Row icon={Phone} label="PIC" value="Rina A." />
          </dl>
        </div>

        {/* Riwayat Interaksi */}
        <div className="panel p-5 xl:col-span-2">
          <h3 className="font-semibold text-navy">Riwayat Interaksi</h3>
          <p className="text-xs text-muted-foreground">Riwayat interaksi nasabah lintas channel.</p>
          <ol className="mt-4 relative border-l border-border pl-5 space-y-4">
            {customerInteraksi.map((it, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                <div className="text-xs font-medium text-muted-foreground">{it.tanggal}</div>
                <div className="text-sm text-navy">{it.aksi}</div>
              </li>
            ))}
          </ol>
        </div>

        {/* Minat Produk */}
        <div className="panel p-5">
          <h3 className="font-semibold text-navy">Minat Produk</h3>
          <p className="text-xs text-muted-foreground">Produk yang relevan untuk ditawarkan.</p>
          <ul className="mt-4 space-y-2">
            {minat.map((m) => (
              <li key={m} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <span className="text-navy font-medium">{m}</span>
                <StatusBadge tone="blue">Relevan</StatusBadge>
              </li>
            ))}
          </ul>
        </div>

        {/* Tindak Lanjut */}
        <div className="panel p-5 md:col-span-2 xl:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-navy">Tindak Lanjut Berikutnya</h3>
              <p className="text-xs text-muted-foreground">Membantu prioritas tindak lanjut nasabah.</p>
            </div>
            <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1.5" />Tambah Tindakan</Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tindakLanjut.map((t, i) => (
              <div key={t} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                  <StatusBadge tone={i === 0 ? "orange" : "blue"}>{i === 0 ? "Hari ini" : "Pekan ini"}</StatusBadge>
                </div>
                <div className="mt-2 text-sm font-medium text-navy">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-medium text-navy text-sm">{value}</span>
      </div>
    </div>
  );
}
