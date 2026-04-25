import { useState } from "react";
import { LayoutDashboard, Home, Users, AlertCircle, Building2, Megaphone, BarChart3, ShieldCheck, Search, Download, Plus, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import btnLogo from "@/assets/btn-logo.png";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

export type PageKey = "overview" | "lead" | "customer" | "case" | "cabang" | "campaign" | "laporan" | "integrasi";

const menu: { key: PageKey; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, group: "Utama" },
  { key: "lead", label: "Lead KPR", icon: Home, group: "Utama" },
  { key: "customer", label: "Customer 360", icon: Users, group: "Utama" },
  { key: "case", label: "Case & SLA", icon: AlertCircle, group: "Utama" },
  { key: "cabang", label: "Cabang", icon: Building2, group: "Operasional" },
  { key: "campaign", label: "Campaign", icon: Megaphone, group: "Operasional" },
  { key: "laporan", label: "Laporan", icon: BarChart3, group: "Operasional" },
  { key: "integrasi", label: "Kesiapan Integrasi", icon: ShieldCheck, group: "Sistem" },
];

interface Props {
  current: PageKey;
  onChange: (k: PageKey) => void;
  onAddLead: () => void;
  search: string;
  onSearch: (s: string) => void;
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle: string;
}

export function AppShell({ current, onChange, onAddLead, search, onSearch, children, pageTitle, pageSubtitle }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const groups = Array.from(new Set(menu.map((m) => m.group)));

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <img src={btnLogo} alt="BTN" className="h-7 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">CRM MODERNIZATION</span>
            <span className="text-sm font-bold text-navy">Demo Dashboard</span>
          </div>
        </div>
        <nav className="flex flex-col gap-5 px-3 py-5">
          {groups.map((g) => (
            <div key={g}>
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</div>
              <div className="flex flex-col gap-0.5">
                {menu.filter((m) => m.group === g).map((m) => {
                  const Icon = m.icon;
                  const active = current === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => { onChange(m.key); setMobileOpen(false); }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="flex-1">{m.label}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3 rounded-lg border border-border bg-primary-light/60 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Mode Demo
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Seluruh data adalah dummy. Tidak terhubung ke sistem produksi.
          </p>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-navy/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button className="lg:hidden -ml-1 p-2 text-muted-foreground" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex flex-col">
              <h1 className="text-base font-bold text-navy leading-tight">{pageTitle}</h1>
              <p className="text-xs text-muted-foreground leading-tight">{pageSubtitle}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
              <div className="relative hidden sm:block w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Cari nasabah, nomor lead, cabang, atau status"
                  className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Download className="h-4 w-4 mr-1.5" /> Export Demo
              </Button>
              <Button
                size="sm"
                onClick={onAddLead}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Tambah Lead Dummy
              </Button>
              <StatusBadge tone="orange" className="hidden md:inline-flex">Data Dummy</StatusBadge>
            </div>
          </div>
          {/* Mobile title */}
          <div className="md:hidden px-4 pb-3">
            <h1 className="text-base font-bold text-navy leading-tight">{pageTitle}</h1>
            <p className="text-xs text-muted-foreground leading-tight">{pageSubtitle}</p>
          </div>
        </header>

        <main className="p-4 sm:p-6 animate-fade-in">{children}</main>

        <footer className="border-t border-border bg-card mt-8">
          <div className="px-4 sm:px-6 py-5 text-xs text-muted-foreground flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
            <div>
              <span className="font-semibold text-navy">BTN CRM Modernization Demo</span> · Prepared as visual concept by VIBOXS
            </div>
            <div className="md:text-right">
              Demo visual internal — menggunakan data dummy. Tidak terhubung ke sistem produksi.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
