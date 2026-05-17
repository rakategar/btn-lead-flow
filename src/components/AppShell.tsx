import { useState } from "react";
import { LayoutGrid, Gauge, Workflow, ClipboardCheck, BellRing, LineChart, Search, Plus, Menu, ListChecks, ShieldCheck, LogOut, Crown, UserRound, FileText, Building2, Target, Brain, AlertOctagon, Users2, Settings, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ActLogo } from "@/components/ActLogo";
import type { SessionUser } from "@/lib/auth";

export type PageKey =
  | "overview" | "command" | "pipeline" | "activity" | "followup" | "kpi" | "laporan"
  | "mgmt-overview" | "mgmt-command" | "mgmt-branch" | "mgmt-kpi" | "mgmt-pipeline"
  | "mgmt-alerts" | "mgmt-ai" | "mgmt-users" | "mgmt-config" | "mgmt-audit";

const menu: { key: PageKey; label: string; icon: React.ComponentType<any>; group: string; leaderOnly?: boolean; managementOnly?: boolean }[] = [
  // Leader & RM
  { key: "overview", label: "Overview", icon: LayoutGrid, group: "Ringkasan" },
  { key: "command", label: "A.C.T Command Center", icon: Gauge, group: "Ringkasan" },
  { key: "pipeline", label: "Pipeline & Leads", icon: Workflow, group: "Operasional" },
  { key: "activity", label: "Activity Daily", icon: ClipboardCheck, group: "Operasional" },
  { key: "followup", label: "Follow-Up & Status", icon: BellRing, group: "Operasional" },
  { key: "kpi", label: "KPI & Review", icon: LineChart, group: "Manajemen" },
  { key: "laporan", label: "Generate Laporan", icon: FileText, group: "Manajemen", leaderOnly: true },
  // Senior Leader
  { key: "mgmt-overview", label: "Executive Overview",  icon: LayoutGrid,    group: "Executive",  managementOnly: true },
  { key: "mgmt-command",  label: "A.C.T Command Center", icon: Gauge,         group: "Executive",  managementOnly: true },
  { key: "mgmt-branch",   label: "Branch Performance",  icon: Building2,     group: "Analitik",   managementOnly: true },
  { key: "mgmt-kpi",      label: "KPI & Target Tracker", icon: Target,        group: "Analitik",   managementOnly: true },
  { key: "mgmt-pipeline", label: "Pipeline Intelligence", icon: Workflow,     group: "Analitik",   managementOnly: true },
  { key: "mgmt-alerts",   label: "Early Warning System", icon: AlertOctagon,  group: "Analitik",   managementOnly: true },
  { key: "mgmt-ai",       label: "AI Insight Center",   icon: Brain,         group: "Analitik",   managementOnly: true },
  { key: "mgmt-users",    label: "User & Role Mgmt",    icon: Users2,        group: "Sistem",     managementOnly: true },
  { key: "mgmt-config",   label: "System Configuration", icon: Settings,      group: "Sistem",     managementOnly: true },
  { key: "mgmt-audit",    label: "Audit & Governance",  icon: History,       group: "Sistem",     managementOnly: true },
];

interface Props {
  current: PageKey;
  onChange: (k: PageKey) => void;
  onAddLead?: () => void;
  onAddActivity?: () => void;
  search: string;
  onSearch: (s: string) => void;
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle: string;
  user: SessionUser;
  onLogout: () => void;
  warningCount?: number;
}

export function AppShell({ current, onChange, onAddLead, onAddActivity, search, onSearch, children, pageTitle, pageSubtitle, user, onLogout, warningCount = 0 }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMgmt = user.role === "management";
  const visibleMenu = menu.filter((m) => {
    if (m.managementOnly) return isMgmt;
    if (isMgmt) return false;
    if (m.leaderOnly) return user.role === "leader";
    return true;
  });
  const groups = Array.from(new Set(visibleMenu.map((m) => m.group)));
  const RoleIcon = isMgmt ? ShieldCheck : user.role === "leader" ? Crown : UserRound;
  const roleLabel = isMgmt ? "Senior Leader" : user.role === "leader" ? "Leader" : "RM";

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
            <span className="font-display text-sm font-bold text-navy tracking-tight">A.C.T Sales CRM</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Primera Karya Sinergia</span>
          </div>
        </div>
        <nav className="flex flex-col gap-5 px-3 py-5">
          {groups.map((g) => (
            <div key={g}>
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</div>
              <div className="flex flex-col gap-0.5">
                {visibleMenu.filter((m) => m.group === g).map((m) => {
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
                      <Icon className={cn("h-[18px] w-[18px]", active ? "text-primary" : "text-muted-foreground")} strokeWidth={1.75} />
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
              <h1 className="font-display text-base font-bold text-navy leading-tight tracking-tight">{pageTitle}</h1>
              <p className="text-xs text-muted-foreground leading-tight">{pageSubtitle}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
              <div className="relative hidden sm:block w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Cari lead, aktivitas, RM, atau Leader"
                  className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              {!isMgmt && user.role === "rm" && (
                <NotificationsBell rmName={user.name} />
              )}
              {!isMgmt && user.role !== "rm" && (
                <button
                  onClick={() => onChange("overview")}
                  className="relative p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-navy"
                  title="AI Early Warning"
                  aria-label="AI Early Warning"
                >
                  <BellRing className="h-5 w-5" />
                  {warningCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                      {warningCount > 99 ? "99+" : warningCount}
                    </span>
                  )}
                </button>
              )}
              {!isMgmt && (
                <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => onChange("pipeline")}>
                  <ListChecks className="h-4 w-4 mr-1.5" /> Lihat Pipeline
                </Button>
              )}
              {user.role === "rm" && onAddLead && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAddLead}
                  className="border-primary/40 text-primary hover:bg-primary-light/50"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Tambah Leads
                </Button>
              )}
              {user.role === "rm" && onAddActivity && (
                <Button
                  size="sm"
                  onClick={onAddActivity}
                  className="bg-[hsl(var(--gold))] text-navy hover:bg-[hsl(var(--gold))]/90 shadow-sm font-semibold"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Tambah Activity
                </Button>
              )}
              <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-gold">
                  <RoleIcon className="h-4 w-4" />
                </div>
                <div className="leading-tight text-right">
                  <div className="text-xs font-semibold text-navy">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground">{roleLabel}{user.leaderName ? ` · ${user.leaderName}` : ""}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-danger" onClick={onLogout} title="Keluar">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* Mobile title */}
          <div className="md:hidden px-4 pb-3">
            <h1 className="font-display text-base font-bold text-navy leading-tight tracking-tight">{pageTitle}</h1>
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
