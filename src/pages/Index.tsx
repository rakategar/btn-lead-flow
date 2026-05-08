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
import { initialLeads, leaderOfRM, leaders, type Lead } from "@/lib/dummy-data";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoginScreen } from "@/components/LoginScreen";
import { toast } from "sonner";
import { personalWarnings } from "@/lib/ai-sales";

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  overview: { title: "A.C.T Sales CRM Demo", subtitle: "Sales Performance Dashboard & CRM Concept — Primera Karya Sinergia." },
  command: { title: "A.C.T Command Center", subtitle: "Visibilitas penuh: pipeline, efektivitas aktivitas, dan KPI MTD." },
  pipeline: { title: "Pipeline & Leads", subtitle: "Manajemen lead berbasis status dan tahap pipeline." },
  activity: { title: "Activity Daily", subtitle: "Action Daily — ritme harian Sales Team dan Sales Leader." },
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

const dummyNames = ["Putri Maharani", "Eko Saputra", "Lina Marlina", "Hadi Kurniawan", "Citra Dewi", "Bagas Pradana"];
const products = ["KPR Rumah Pertama", "KPR Subsidi", "Take Over KPR", "KPR Platinum"];
const fallbackRMs = leaders.flatMap((l) => l.rms);

const IndexInner = () => {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<PageKey>("overview");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");

  // Set landing page sesuai role saat login
  useEffect(() => {
    if (user?.role === "management") setPage("mgmt-overview");
    else if (user) setPage("overview");
  }, [user]);

  // Scope leads by role (dihitung selalu agar urutan hooks stabil)
  const scopedLeads = useMemo(() => {
    if (!user) return [] as Lead[];
    if (user.role === "management") return leads;
    return leads.filter((l) =>
      user.role === "leader" ? l.leader === user.name : l.pic === user.name
    );
  }, [leads, user]);

  const handleAddActivity = () => {
    if (!user) return;
    const seq = leads.length + 1;
    const id = `LD-${seq.toString().padStart(3, "0")}`;
    // RM untuk aktivitas dummy:
    // - jika login sebagai RM, gunakan dirinya
    // - jika login sebagai leader, pilih salah satu RM dalam tim-nya
    const teamRMs = leaders.find((l) => l.name === user.name)?.rms ?? fallbackRMs;
    const rm = user.role === "rm" ? user.name : teamRMs[seq % teamRMs.length];
    const leader = user.role === "leader" ? user.name : (user.leaderName ?? leaderOfRM(rm));
    const newLead: Lead = {
      id,
      nama: dummyNames[seq % dummyNames.length],
      stage: "Contact",
      priority: "Medium",
      pic: rm,
      leader,
      source: "Aktivitas dummy",
      produk: products[seq % products.length],
      lastActivity: "Aktivitas baru ditambahkan",
      nextFollowUp: "Besok",
      fuStage: "FU1",
      status: "In Progress",
      ringkasan: "Aktivitas dummy dibuat dari header. Lead masuk tahap Contact.",
    };
    setLeads((prev) => [newLead, ...prev]);
    toast.success("Aktivitas dummy ditambahkan", {
      description: `${newLead.nama} · ${newLead.produk} · RM ${newLead.pic} · Leader ${newLead.leader}`,
    });
    if (page === "overview") setPage("pipeline");
  };

  const meta = pageMeta[page];

  const content = useMemo(() => {
    switch (page) {
      case "overview": return <OverviewPage onNavigate={setPage} user={user!} leads={scopedLeads} />;
      case "command": return <CommandCenterPage leads={scopedLeads} />;
      case "pipeline": return <PipelinePage leads={scopedLeads} setLeads={setLeads} globalSearch={search} />;
      case "activity": return <ActivityDailyPage />;
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
  }, [page, scopedLeads, search, user]);

  if (!user) return <LoginScreen />;

  const warningCount = useMemo(
    () => (user && user.role !== "management" ? personalWarnings(scopedLeads).length : 0),
    [scopedLeads, user]
  );

  return (
    <AppShell
      current={page}
      onChange={setPage}
      onAddActivity={handleAddActivity}
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
  );
};

const Index = () => (
  <AuthProvider>
    <IndexInner />
  </AuthProvider>
);

export default Index;
