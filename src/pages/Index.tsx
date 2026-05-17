import { useEffect, useMemo, useState } from "react";
import { AppShell, type PageKey } from "@/components/AppShell";
import { OverviewPage } from "@/components/pages/OverviewPage";
import { CommandCenterPage } from "@/components/pages/CommandCenterPage";
import { PipelinePage } from "@/components/pages/PipelinePage";
import { ActivityDailyPage } from "@/components/pages/ActivityDailyPage";
import { FollowUpPage } from "@/components/pages/FollowUpPage";
import { KpiReviewPage } from "@/components/pages/KpiReviewPage";
import { GenerateLaporanPage } from "@/components/pages/GenerateLaporanPage";
import { ExecutiveOverviewPage } from "@/components/pages/management/ExecutiveOverviewPage";
import { MgmtCommandCenterPage } from "@/components/pages/management/MgmtCommandCenterPage";
import { BranchPerformancePage } from "@/components/pages/management/BranchPerformancePage";
import { KpiTrackerPage } from "@/components/pages/management/KpiTrackerPage";
import { PipelineIntelligencePage } from "@/components/pages/management/PipelineIntelligencePage";
import { EarlyWarningPage } from "@/components/pages/management/EarlyWarningPage";
import { AiInsightCenterPage } from "@/components/pages/management/AiInsightCenterPage";
import { UserManagementPage } from "@/components/pages/management/UserManagementPage";
import { SystemConfigPage } from "@/components/pages/management/SystemConfigPage";
import { AuditGovernancePage } from "@/components/pages/management/AuditGovernancePage";
import { initialLeads, leaderOfRM, leaders, type Lead, type RmActivity } from "@/lib/dummy-data";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoginScreen } from "@/components/LoginScreen";
import { personalWarnings } from "@/lib/ai-sales";
import { AddLeadModal } from "@/components/forms/AddLeadModal";
import { AddActivityModal } from "@/components/forms/AddActivityModal";
import { supabase } from "@/integrations/supabase/client";
import { loadLeads, loadActivities, insertLead, insertActivity, seedLeadsIfEmpty, rowToLead, rowToActivity } from "@/lib/persist";
import { toast } from "sonner";

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  overview: { title: "A.C.T Sales CRM Demo", subtitle: "Sales Performance Dashboard & CRM Concept — Primera Karya Sinergia." },
  command: { title: "A.C.T Command Center", subtitle: "Visibilitas penuh: pipeline, efektivitas aktivitas, dan KPI MTD." },
  pipeline: { title: "Pipeline & Leads", subtitle: "Manajemen lead berbasis status dan tahap pipeline." },
  activity: { title: "Activity Daily", subtitle: "Action Daily — ritme harian RM dan Leader." },
  followup: { title: "Follow-Up & Status", subtitle: "Skema eskalasi FU1 → FU3 dan status resolusi pipeline." },
  kpi: { title: "KPI & Review", subtitle: "Weekly & monthly rhythm, alignment, dan result area." },
  laporan: { title: "Generate Laporan", subtitle: "Buat laporan otomatis berdasarkan data dashboard saat ini." },
  "mgmt-overview": { title: "Executive Overview", subtitle: "Ringkasan performa nasional lintas cabang dan area." },
  "mgmt-command":  { title: "A.C.T Command Center — Nasional", subtitle: "Pipeline board, funnel conversion, dan remedial dashboard semua cabang." },
  "mgmt-branch":   { title: "Branch Performance", subtitle: "Perbandingan performa, drill-down, dan heatmap cabang." },
  "mgmt-kpi":      { title: "KPI & Target Tracker", subtitle: "KPI per produk, perbandingan periode, dan produktivitas officer." },
  "mgmt-pipeline": { title: "Pipeline Intelligence", subtitle: "Health score, distribusi temperatur, stage aging, dan diagnosis konversi." },
  "mgmt-alerts":   { title: "Early Warning System", subtitle: "Alert Critical, Warning, Watch dengan eskalasi ke leader cabang." },
  "mgmt-ai":       { title: "AI Insight Center", subtitle: "AI Executive Summary, rekomendasi, dan generator remedial plan." },
  "mgmt-users":    { title: "User & Role Management", subtitle: "Direktori pengguna, role matrix, dan bulk action akses." },
  "mgmt-config":   { title: "System Configuration", subtitle: "Cabang, target, rules follow-up, dan konfigurasi AI." },
  "mgmt-audit":    { title: "Audit & Governance", subtitle: "Log aktivitas, log export, keamanan, dan kualitas data." },
};

const IndexInner = () => {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<PageKey>("overview");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<RmActivity[]>([]);
  const [search, setSearch] = useState("");
  const [openAddLead, setOpenAddLead] = useState(false);
  const [openAddActivity, setOpenAddActivity] = useState(false);

  // Set landing page sesuai role saat login
  useEffect(() => {
    if (user?.role === "management") setPage("mgmt-overview");
    else if (user) setPage("overview");
  }, [user]);

  // Load data dari database (+ seed leads jika kosong) & subscribe realtime
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await seedLeadsIfEmpty(initialLeads);
        const [ls, acts] = await Promise.all([loadLeads(), loadActivities()]);
        if (!mounted) return;
        setLeads(ls);
        setActivities(acts);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        toast.error("Gagal memuat data", { description: msg });
      }
    })();

    const ch = supabase
      .channel("leads_acts_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (p) => {
        setLeads((prev) => {
          if (p.eventType === "INSERT") {
            const l = rowToLead(p.new as Parameters<typeof rowToLead>[0]);
            return prev.some((x) => x.id === l.id) ? prev : [l, ...prev];
          }
          if (p.eventType === "UPDATE") {
            const l = rowToLead(p.new as Parameters<typeof rowToLead>[0]);
            return prev.map((x) => (x.id === l.id ? l : x));
          }
          if (p.eventType === "DELETE") {
            const id = (p.old as { id: string }).id;
            return prev.filter((x) => x.id !== id);
          }
          return prev;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "rm_activities" }, (p) => {
        setActivities((prev) => {
          if (p.eventType === "INSERT") {
            const a = rowToActivity(p.new as Parameters<typeof rowToActivity>[0]);
            return prev.some((x) => x.id === a.id) ? prev : [a, ...prev];
          }
          if (p.eventType === "DELETE") {
            const id = (p.old as { id: string }).id;
            return prev.filter((x) => x.id !== id);
          }
          return prev;
        });
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);

  // Scope leads by role (dihitung selalu agar urutan hooks stabil)
  const scopedLeads = useMemo(() => {
    if (!user) return [] as Lead[];
    if (user.role === "management") return leads;
    return leads.filter((l) =>
      user.role === "leader" ? l.leader === user.name : l.pic === user.name
    );
  }, [leads, user]);

  // Scope activities by role
  const scopedActivities = useMemo(() => {
    if (!user) return [] as RmActivity[];
    if (user.role === "management") return activities;
    if (user.role === "leader") return activities.filter((a) => a.leader === user.name);
    return activities.filter((a) => a.rm === user.name);
  }, [activities, user]);

  const meta = pageMeta[page];

  const content = useMemo(() => {
    switch (page) {
      case "overview": return <OverviewPage onNavigate={setPage} user={user!} leads={scopedLeads} activities={scopedActivities} />;
      case "command": return <CommandCenterPage leads={scopedLeads} />;
      case "pipeline": return <PipelinePage leads={scopedLeads} setLeads={setLeads} globalSearch={search} />;
      case "activity": return <ActivityDailyPage extraActivities={scopedActivities} />;
      case "followup": return <FollowUpPage />;
      case "kpi": return <KpiReviewPage />;
      case "laporan": return <GenerateLaporanPage user={user!} leads={scopedLeads} />;
      case "mgmt-overview": return <ExecutiveOverviewPage user={user!} onNavigate={setPage} />;
      case "mgmt-command":  return <MgmtCommandCenterPage leads={scopedLeads} />;
      case "mgmt-branch":   return <BranchPerformancePage />;
      case "mgmt-kpi":      return <KpiTrackerPage />;
      case "mgmt-pipeline": return <PipelineIntelligencePage leads={scopedLeads} />;
      case "mgmt-alerts":   return <EarlyWarningPage />;
      case "mgmt-ai":       return <AiInsightCenterPage />;
      case "mgmt-users":    return <UserManagementPage />;
      case "mgmt-config":   return <SystemConfigPage />;
      case "mgmt-audit":    return <AuditGovernancePage />;
    }
  }, [page, scopedLeads, scopedActivities, search, user]);

  const warningCount = useMemo(
    () => (user && user.role !== "management" ? personalWarnings(scopedLeads).length : 0),
    [scopedLeads, user]
  );

  if (!user) return <LoginScreen />;

  const isRM = user.role === "rm";
  const rmLeaderName = user.leaderName ?? leaderOfRM(user.name);

  return (
    <>
      <AppShell
        current={page}
        onChange={setPage}
        onAddLead={isRM ? () => setOpenAddLead(true) : undefined}
        onAddActivity={isRM ? () => setOpenAddActivity(true) : undefined}
        search={search}
        onSearch={setSearch}
        pageTitle={meta.title}
        pageSubtitle={meta.subtitle}
        user={user}
        onLogout={logout}
        warningCount={warningCount}
      >
        {content}
      </AppShell>

      {isRM && openAddLead && (
        <AddLeadModal
          rmName={user.name}
          leaderName={rmLeaderName}
          existingCount={leads.length}
          onClose={() => setOpenAddLead(false)}
          onSave={(lead) => {
            setLeads((prev) => [lead, ...prev]);
            if (page === "overview") setPage("pipeline");
          }}
        />
      )}

      {isRM && openAddActivity && (
        <AddActivityModal
          rmName={user.name}
          leaderName={rmLeaderName}
          rmLeads={scopedLeads}
          onClose={() => setOpenAddActivity(false)}
          onSave={(a) => {
            setActivities((prev) => [a, ...prev]);
            if (page === "overview") setPage("activity");
          }}
        />
      )}
    </>
  );
};

const Index = () => (
  <AuthProvider>
    <IndexInner />
  </AuthProvider>
);

export default Index;
