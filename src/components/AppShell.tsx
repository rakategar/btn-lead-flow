import { useState } from "react";
import { LayoutDashboard, Activity, GitBranch, CheckSquare, Bell, BarChart3, Search, Plus, Menu, ListChecks, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ActLogo } from "@/components/ActLogo";

export type PageKey = "overview" | "command" | "pipeline" | "activity" | "followup" | "kpi";

const menu: { key: PageKey; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, group: "Ringkasan" },
  { key: "command", label: "A.C.T Command Center", icon: Activity, group: "Ringkasan" },
  { key: "pipeline", label: "Pipeline & Leads", icon: GitBranch, group: "Operasional" },
  { key: "activity", label: "Activity Daily", icon: CheckSquare, group: "Operasional" },
  { key: "followup", label: "Follow-Up & Status", icon: Bell, group: "Operasional" },
  { key: "kpi", label: "KPI & Review", icon: BarChart3, group: "Manajemen" },
];

interface Props {
  current: PageKey;
  onChange: (k: PageKey) => void;
  onAddActivity: () => void;
  search: string;
  onSearch: (s: string) => void;
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle: string;
}

export function AppShell({ current, onChange, onAddActivity, search, onSearch, children, pageTitle, pageSubtitle }: Props) {
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
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <ActLogo size="md" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-navy">A.C.T Sales CRM</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primera Karya Sinergia</span>
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
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3 rounded-lg border border-gold/30 bg-gold-light/60 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy">
            <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--gold))]" /> Mode Demo Konsep
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Visualisasi konsep berbasis kerangka A.C.T. Seluruh data dummy.
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
                  placeholder="Cari lead, aktivitas, atau PIC"
                  className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => onChange("pipeline")}>
                <ListChecks className="h-4 w-4 mr-1.5" /> Lihat Pipeline
              </Button>
              <Button
                size="sm"
                onClick={onAddActivity}
                className="bg-[hsl(var(--gold))] text-navy hover:bg-[hsl(var(--gold))]/90 shadow-sm font-semibold"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Tambah Aktivitas Dummy
              </Button>
              <StatusBadge tone="gold" className="hidden md:inline-flex">Data Dummy</StatusBadge>
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
              <span className="font-semibold text-navy">A.C.T Sales CRM Demo</span> · Sales Performance Dashboard & CRM Concept
              <div className="mt-0.5">Prepared for conceptual demonstration by <span className="font-semibold text-navy">Primera Karya Sinergia</span></div>
            </div>
            <div className="md:text-right">
              Demo visual konsep — data dummy — bukan sistem produksi.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
