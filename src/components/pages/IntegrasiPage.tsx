import { Globe2, Server, Lock, Layers, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const cards = [
  {
    icon: Globe2, title: "Integrasi Digital Channel",
    items: ["balé Properti", "balé by BTN", "Website campaign", "Call center", "Cabang"],
  },
  {
    icon: Server, title: "Integrasi Internal",
    items: ["SSO / login internal", "Data warehouse / reporting", "Existing CRM", "Notification system", "Email / WhatsApp gateway"],
  },
  {
    icon: Lock, title: "Keamanan Data",
    items: ["Role-based access", "Data masking", "Audit trail", "Enkripsi", "Environment terpisah", "No real data for demo"],
  },
];

const tahapan = [
  { l: "Discovery", desc: "Pemetaan kebutuhan & alur kerja" },
  { l: "Prototype", desc: "Konsep visual & validasi awal" },
  { l: "Pilot", desc: "Uji coba terbatas internal" },
  { l: "MVP", desc: "Versi minimum siap pakai" },
  { l: "Rollout", desc: "Implementasi bertahap" },
  { l: "Support", desc: "Pemeliharaan & enhancement" },
];

export function IntegrasiPage() {
  return (
    <div className="space-y-5">
      <div className="panel p-5 sm:p-6 bg-primary-light/40 border-primary/20">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-navy">Catatan Kesiapan Integrasi</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Integrasi final hanya dilakukan setelah discovery, approval teknis, dan mengikuti
              kebijakan keamanan Bank BTN. Halaman ini menunjukkan gambaran area integrasi
              secara non-teknis untuk kebutuhan diskusi awal.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="panel p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-semibold text-navy">{c.title}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {c.items.map((it) => (
                  <li key={it} className="flex items-center gap-2 text-sm text-navy">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="flex-1">{it}</span>
                    <StatusBadge tone="blue">Perlu validasi</StatusBadge>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-navy">Tahapan Implementasi</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Pendekatan bertahap untuk memastikan kualitas dan keamanan.</p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {tahapan.map((t, i) => (
            <li key={t.l} className="relative rounded-lg border border-border p-3">
              <div className="text-[10px] font-mono font-semibold text-muted-foreground">TAHAP {i + 1}</div>
              <div className="mt-1 font-semibold text-navy">{t.l}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border">
          Demo ini menggunakan data dummy. Seluruh akses, integrasi, dan penggunaan data produksi
          wajib mengikuti kebijakan keamanan dan tata kelola Bank BTN.
        </p>
      </div>
    </div>
  );
}
