import { useMemo, useState } from "react";
import { AppShell, type PageKey } from "@/components/AppShell";
import { OverviewPage } from "@/components/pages/OverviewPage";
import { CommandCenterPage } from "@/components/pages/CommandCenterPage";
import { PipelinePage } from "@/components/pages/PipelinePage";
import { ActivityDailyPage } from "@/components/pages/ActivityDailyPage";
import { FollowUpPage } from "@/components/pages/FollowUpPage";
import { KpiReviewPage } from "@/components/pages/KpiReviewPage";
import { initialLeads, type Lead } from "@/lib/dummy-data";
import { toast } from "sonner";

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  overview: { title: "A.C.T Sales CRM Demo", subtitle: "Sales Performance Dashboard & CRM Concept — Primera Karya Sinergia." },
  command: { title: "A.C.T Command Center", subtitle: "Visibilitas penuh: pipeline, efektivitas aktivitas, dan KPI MTD." },
  pipeline: { title: "Pipeline & Leads", subtitle: "Manajemen lead berbasis temperatur dan tahap pipeline." },
  activity: { title: "Activity Daily", subtitle: "Action Daily — ritme harian sales team dan head of sales." },
  followup: { title: "Follow-Up & Status", subtitle: "Skema eskalasi FU1 → FU3 dan status resolusi pipeline." },
  kpi: { title: "KPI & Review", subtitle: "Weekly & monthly rhythm, alignment, dan result area." },
};

const dummyNames = ["Putri Maharani", "Eko Saputra", "Lina Marlina", "Hadi Kurniawan", "Citra Dewi", "Bagas Pradana"];
const products = ["KPR Rumah Pertama", "KPR Subsidi", "Take Over KPR", "KPR Platinum"];
const pics = ["Rina A.", "Dimas R.", "Maya P.", "Fajar H.", "Lala N."];

const Index = () => {
  const [page, setPage] = useState<PageKey>("overview");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");

  const handleAddActivity = () => {
    const seq = leads.length + 1;
    const id = `LD-${seq.toString().padStart(3, "0")}`;
    const newLead: Lead = {
      id,
      nama: dummyNames[seq % dummyNames.length],
      stage: "Contact",
      temperature: "Warm",
      pic: pics[seq % pics.length],
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
      description: `${newLead.nama} · ${newLead.produk} · PIC ${newLead.pic}`,
    });
    if (page === "overview") setPage("pipeline");
  };

  const meta = pageMeta[page];

  const content = useMemo(() => {
    switch (page) {
      case "overview": return <OverviewPage onNavigate={setPage} />;
      case "command": return <CommandCenterPage leads={leads} />;
      case "pipeline": return <PipelinePage leads={leads} setLeads={setLeads} globalSearch={search} />;
      case "activity": return <ActivityDailyPage />;
      case "followup": return <FollowUpPage />;
      case "kpi": return <KpiReviewPage />;
    }
  }, [page, leads, search]);

  return (
    <AppShell
      current={page}
      onChange={setPage}
      onAddActivity={handleAddActivity}
      search={search}
      onSearch={setSearch}
      pageTitle={meta.title}
      pageSubtitle={meta.subtitle}
    >
      {content}
    </AppShell>
  );
};

export default Index;
