import { useState, useEffect } from "react";
import {
  LayoutGrid, Gauge, Workflow, ClipboardCheck, BellRing, LineChart,
  Plus, Menu, ListChecks, ShieldCheck, LogOut, Crown, UserRound, FileText,
  Building2, Target, Brain, AlertOctagon, Users2, Settings, History, X,
  Search, ChevronRight, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ActLogo } from "@/components/ActLogo";
import type { SessionUser } from "@/lib/auth";
import { NotificationsBell } from "@/components/ai/NotificationsBell";
import { SearchAutocomplete, type SearchItem } from "@/components/SearchAutocomplete";
import { PageProgressBar } from "@/components/PageProgressBar";

export type PageKey =
  | "overview" | "command" | "pipeline" | "activity" | "followup" | "kpi" | "laporan"
  | "mgmt-overview" | "mgmt-command" | "mgmt-branch" | "mgmt-kpi" | "mgmt-pipeline"
  | "mgmt-alerts" | "mgmt-ai" | "mgmt-users" | "mgmt-config" | "mgmt-audit";

const menu: {
  key: PageKey;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  group: string;
  leaderOnly?: boolean;
  managementOnly?: boolean;
}[] = [
  { key: "overview",      label: "Overview",              icon: LayoutGrid,   group: "Ringkasan" },
  { key: "command",       label: "A.C.T Command Center",  icon: Gauge,        group: "Ringkasan" },
  { key: "pipeline",      label: "Pipeline & Leads",      icon: Workflow,     group: "Operasional" },
  { key: "activity",      label: "Activity Daily",        icon: ClipboardCheck, group: "Operasional" },
  { key: "followup",      label: "Follow-Up & Status",    icon: BellRing,     group: "Operasional" },
  { key: "kpi",           label: "KPI & Review",          icon: LineChart,    group: "Manajemen" },
  { key: "laporan",       label: "Generate Laporan",      icon: FileText,     group: "Manajemen", leaderOnly: true },
  { key: "mgmt-overview", label: "Executive Overview",    icon: LayoutGrid,   group: "Executive",  managementOnly: true },
  { key: "mgmt-command",  label: "A.C.T Command Center",  icon: Gauge,        group: "Executive",  managementOnly: true },
  { key: "mgmt-branch",   label: "Branch Performance",    icon: Building2,    group: "Analitik",   managementOnly: true },
  { key: "mgmt-kpi",      label: "KPI & Target Tracker",  icon: Target,       group: "Analitik",   managementOnly: true },
  { key: "mgmt-pipeline", label: "Pipeline Intelligence", icon: Workflow,     group: "Analitik",   managementOnly: true },
  { key: "mgmt-alerts",   label: "Early Warning System",  icon: AlertOctagon, group: "Analitik",   managementOnly: true },
  { key: "mgmt-ai",       label: "AI Insight Center",     icon: Brain,        group: "Analitik",   managementOnly: true },
  { key: "mgmt-users",    label: "User & Role Mgmt",      icon: Users2,       group: "Sistem",     managementOnly: true },
  { key: "mgmt-config",   label: "System Configuration",  icon: Settings,     group: "Sistem",     managementOnly: true },
  { key: "mgmt-audit",    label: "Audit & Governance",    icon: History,      group: "Sistem",     managementOnly: true },
];

const pageGroupLabel: Partial<Record<PageKey, string[]>> = {
  overview: ["Ringkasan", "Overview"],
  command:  ["Ringkasan", "A.C.T Command Center"],
  pipeline: ["Operasional", "Pipeline & Leads"],
  activity: ["Operasional", "Activity Daily"],
  followup: ["Operasional", "Follow-Up & Status"],
  kpi:      ["Manajemen", "KPI & Review"],
  laporan:  ["Manajemen", "Generate Laporan"],
  "mgmt-overview": ["Executive", "Executive Overview"],
  "mgmt-command":  ["Executive", "Command Center"],
  "mgmt-branch":   ["Analitik", "Branch Performance"],
  "mgmt-kpi":      ["Analitik", "KPI & Target Tracker"],
  "mgmt-pipeline": ["Analitik", "Pipeline Intelligence"],
  "mgmt-alerts":   ["Analitik", "Early Warning System"],
  "mgmt-ai":       ["Analitik", "AI Insight Center"],
  "mgmt-users":    ["Sistem", "User & Role Mgmt"],
  "mgmt-config":   ["Sistem", "System Configuration"],
  "mgmt-audit":    ["Sistem", "Audit & Governance"],
};

interface Props {
  current: PageKey;
  onChange: (k: PageKey) => void;
  onAddLead?: () => void;
  onAddActivity?: () => void;
  search: string;
  onSearch: (s: string) => void;
  searchItems?: SearchItem[];
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle: string;
  user: SessionUser;
  onLogout: () => void;
  warningCount?: number;
  isLoading?: boolean;
}

export function AppShell({
  current, onChange, onAddLead, onAddActivity, search, onSearch, searchItems = [],
  children, pageTitle, pageSubtitle, user, onLogout, warningCount = 0, isLoading,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const demoBannerDismissed = true;

  const isMgmt = user.role === "management";
  const visibleMenu = menu.filter((m) => {
    if (m.managementOnly) return isMgmt;
    if (isMgmt) return false;
    if (m.leaderOnly) return user.role === "leader";
    return true;
  });
  const filteredMenu = menuSearch.trim()
    ? visibleMenu.filter((m) => m.label.toLowerCase().includes(menuSearch.toLowerCase()))
    : visibleMenu;
  const groups = Array.from(new Set(filteredMenu.map((m) => m.group)));
  const RoleIcon = isMgmt ? ShieldCheck : user.role === "leader" ? Crown : UserRound;
  const roleLabel = isMgmt ? "Senior Leader" : user.role === "leader" ? "Leader" : "RM";
  const breadcrumb = pageGroupLabel[current];

  // Close mobile on nav
  const handleNav = (k: PageKey) => { onChange(k); setMobileOpen(false); setMenuSearch(""); };

  // Lock scroll when mobile open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const dismissDemoBanner = () => {
    setDemoBannerDismissed(true);
    try { sessionStorage.setItem("demo_banner_dismissed", "1"); } catch { /* ignore */ }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 shrink-0">
        <ActLogo size="md" />
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm font-bold text-white tracking-tight">A.C.T Sales CRM</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground">Primera Karya Sinergia</span>
        </div>
        {mobileOpen && (
          <button
            className="ml-auto p-1.5 rounded-md text-sidebar-foreground hover:text-white hover:bg-sidebar-accent transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Menu search */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground pointer-events-none" />
          <input
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            placeholder="Filter menu…"
            className="h-8 w-full rounded-md border border-sidebar-border bg-sidebar-accent/50 pl-8 pr-2 text-xs text-white placeholder:text-sidebar-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-ring/40 focus:bg-sidebar-accent transition-all"
            aria-label="Cari menu"
          />
          {menuSearch && (
            <button
              onClick={() => setMenuSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sidebar-foreground hover:text-white"
              aria-label="Hapus filter menu"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4" aria-label="Navigasi utama">
        {groups.length === 0 && (
          <p className="text-xs text-sidebar-foreground text-center py-4">Tidak ada menu ditemukan</p>
        )}
        {groups.map((g) => (
          <div key={g}>
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground">{g}</div>
            <div className="space-y-0.5">
              {filteredMenu.filter((m) => m.group === g).map((m) => {
                const Icon = m.icon;
                const active = current === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => handleNav(m.key)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 text-left relative",
                      active
                        ? "bg-[hsl(var(--primary))]/20 text-white font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                    )}
                  >
                    {/* Active left border */}
                    {active && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[hsl(var(--primary))]" aria-hidden="true" />
                    )}
                    <Icon
                      className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-[hsl(var(--primary))]" : "text-sidebar-foreground group-hover:text-white")}
                      strokeWidth={active ? 2 : 1.75}
                    />
                    <span className="flex-1 truncate">{m.label}</span>
                    {warningCount > 0 && m.key === "overview" && (
                      <span
                        className="h-4.5 min-w-[18px] px-1 rounded-full bg-[hsl(var(--danger))] text-white text-[10px] font-bold flex items-center justify-center"
                        title={`${warningCount} item memerlukan perhatian Anda`}
                      >
                        {warningCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User info + dropdown */}
      <div className="shrink-0 border-t border-sidebar-border px-3 py-3 relative">
        {userMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border border-sidebar-border bg-[hsl(var(--navy))] shadow-lg overflow-hidden z-50">
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white hover:bg-sidebar-accent transition-colors text-left">
              <UserRound className="h-3.5 w-3.5 text-sidebar-foreground" /> Profil Saya
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white hover:bg-sidebar-accent transition-colors text-left">
              <Settings className="h-3.5 w-3.5 text-sidebar-foreground" /> Pengaturan
            </button>
            <div className="border-t border-sidebar-border" />
            <button
              onClick={() => { setUserMenuOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#ff0000] hover:bg-[rgba(255,0,0,0.08)] transition-colors text-left"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </button>
          </div>
        )}
        <button
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-left"
          style={{ backgroundColor: userMenuOpen ? "rgba(255,255,255,0.08)" : undefined }}
          onMouseOver={(e) => { if (!userMenuOpen) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
          onMouseOut={(e) => { if (!userMenuOpen) e.currentTarget.style.backgroundColor = ""; }}
          onClick={() => setUserMenuOpen((o) => !o)}
          title="Pengaturan & Keluar"
          aria-label="Menu pengguna"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white">
            <RoleIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-[10px] text-sidebar-foreground truncate">
              {roleLabel}{user.leaderName ? ` · ${user.leaderName}` : ""}
            </div>
          </div>
          <Settings className="h-3.5 w-3.5 text-sidebar-foreground shrink-0" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageProgressBar loading={!!isLoading} />

      {/* Demo Banner */}
      {!demoBannerDismissed && (
        <div
          className="sticky top-0 z-50 flex items-center gap-3 bg-[hsl(var(--info-light))] border-b border-[hsl(var(--info))]/20 px-4 py-2 text-sm text-[hsl(217,60%,35%)] animate-fade-in-down"
          role="banner"
          aria-label="Mode demo"
        >
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-xs font-medium">
            <strong>Mode Demo</strong> — Data yang ditampilkan adalah data sampel untuk keperluan demonstrasi. Bukan sistem produksi.
          </span>
          <button
            onClick={dismissDemoBanner}
            className="ml-auto p-1 rounded hover:bg-[hsl(var(--info))]/10 transition-colors"
            aria-label="Tutup banner demo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside
        className="fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar hidden lg:flex flex-col"
        aria-label="Sidebar navigasi"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy/40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[280px] border-r border-sidebar-border bg-sidebar flex flex-col lg:hidden transition-transform duration-250 ease-out",
          mobileOpen ? "translate-x-0 animate-slide-in-left" : "-translate-x-full"
        )}
        aria-label="Sidebar navigasi mobile"
        aria-hidden={!mobileOpen}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className={cn("lg:pl-64", !demoBannerDismissed && "")}>
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur" role="banner">
          <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
            {/* Hamburger */}
            <button
              className="lg:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={mobileOpen}
              aria-controls="mobile-sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb - desktop only */}
            {breadcrumb && (
              <nav aria-label="Breadcrumb" className="hidden md:flex items-center">
                <button
                  onClick={() => handleNav(isMgmt ? "mgmt-overview" : "overview")}
                  className="text-[13px] cursor-pointer transition-colors hover:underline"
                  style={{ color: "#64748b" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#005bfd")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#64748b")}
                >
                  Home
                </button>
                <ChevronRight className="h-3 w-3 mx-1.5" style={{ color: "#94a3b8" }} aria-hidden="true" />
                <span className="text-[13px] transition-colors" style={{ color: "#64748b" }}>{breadcrumb[0]}</span>
                <ChevronRight className="h-3 w-3 mx-1.5" style={{ color: "#94a3b8" }} aria-hidden="true" />
                <span className="text-[13px] font-semibold cursor-default" style={{ color: "#1a2332" }}>{breadcrumb[1]}</span>
              </nav>
            )}

            {/* Page title - mobile */}
            <div className="md:hidden flex-1 min-w-0">
              <h1 className="font-display text-sm font-bold text-navy leading-tight truncate">{pageTitle}</h1>
            </div>

            {/* Actions right side */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {/* Search autocomplete */}
              <SearchAutocomplete
                value={search}
                onChange={onSearch}
                items={searchItems}
                onSelectItem={(item) => {
                  if (item.pageKey) handleNav(item.pageKey as PageKey);
                }}
                className="hidden sm:block w-56 lg:w-72"
              />

              {/* Notifications */}
              {!isMgmt && user.role === "rm" && (
                <NotificationsBell rmName={user.name} />
              )}
              {!isMgmt && user.role !== "rm" && (
                <button
                  onClick={() => handleNav("overview")}
                  className="relative p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-navy transition-colors"
                  title="AI Early Warning"
                  aria-label={`AI Early Warning${warningCount > 0 ? ` — ${warningCount} peringatan` : ""}`}
                >
                  <BellRing className="h-5 w-5" />
                  {warningCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(var(--danger))] text-white text-[10px] font-bold flex items-center justify-center" aria-hidden="true">
                      {warningCount > 99 ? "99+" : warningCount}
                    </span>
                  )}
                </button>
              )}

              {/* Quick nav buttons - desktop */}
              {!isMgmt && (() => {
                const leadCount = searchItems.filter((i) => i.type === "lead").length;
                return (
                  <div className="relative hidden lg:inline-flex">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNav("pipeline")}
                      title="Lihat seluruh pipeline dan leads Anda"
                    >
                      <ListChecks className="h-4 w-4" /> Lihat Pipeline
                    </Button>
                    {leadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 rounded-[10px] px-1 text-[10px] font-bold text-white" style={{ backgroundColor: "#ff0000" }}>
                        {leadCount}
                      </span>
                    )}
                  </div>
                );
              })()}
              {user.role === "rm" && onAddLead && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAddLead}
                  className="border-primary/40 text-primary hover:bg-[hsl(var(--primary-light))]/50 hidden sm:inline-flex"
                  aria-label="Tambah lead baru"
                >
                  <Plus className="h-4 w-4" /> <span className="hidden md:inline">Tambah Leads</span>
                </Button>
              )}
              {user.role === "rm" && onAddActivity && (
                <Button
                  size="sm"
                  onClick={onAddActivity}
                  className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 shadow-sm font-semibold"
                  aria-label="Tambah aktivitas baru"
                >
                  <Plus className="h-4 w-4" /> <span className="hidden md:inline">Tambah Activity</span>
                </Button>
              )}

              {/* User avatar - desktop */}
              <div className="hidden lg:flex items-center gap-2 pl-2 ml-1 border-l border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[hsl(var(--gold))]" aria-hidden="true">
                  <RoleIcon className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-navy">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground">{roleLabel}{user.leaderName ? ` · ${user.leaderName}` : ""}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger-light))]"
                  onClick={onLogout}
                  aria-label="Keluar dari aplikasi"
                  title="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile subtitle */}
          <div className="md:hidden px-4 pb-2.5 pt-0">
            <p className="text-xs text-muted-foreground leading-tight truncate">{pageSubtitle}</p>
          </div>
        </header>

        {/* Page heading - desktop */}
        <div className="hidden md:block px-5 lg:px-6 pt-5 pb-1">
          <h1 className="font-display text-xl font-bold text-navy leading-tight tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{pageSubtitle}</p>
        </div>

        <main className="px-3 sm:px-5 lg:px-6 py-4 sm:py-5 animate-fade-in" id="main-content">
          {children}
        </main>

        <footer className="border-t border-border bg-card mt-6" role="contentinfo">
          <div className="px-4 sm:px-6 py-4 text-xs text-muted-foreground flex flex-col md:flex-row gap-1.5 md:items-center md:justify-between">
            <div>
              <span className="font-semibold text-navy">A.C.T Sales CRM Demo</span> · Sales Performance Dashboard & CRM Concept
              <div className="mt-0.5">Prepared for conceptual demonstration by <span className="font-semibold text-navy">Primera Karya Sinergia</span></div>
            </div>
            <div className="md:text-right text-muted-foreground/70">Demo visual konsep — data dummy — bukan sistem produksi.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
