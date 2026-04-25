import { useMemo, useState } from "react";
import { AppShell, type PageKey } from "@/components/AppShell";
import { OverviewPage } from "@/components/pages/OverviewPage";
import { LeadPage } from "@/components/pages/LeadPage";
import { CustomerPage } from "@/components/pages/CustomerPage";
import { CasePage } from "@/components/pages/CasePage";
import { CabangPage } from "@/components/pages/CabangPage";
import { CampaignPage } from "@/components/pages/CampaignPage";
import { LaporanPage } from "@/components/pages/LaporanPage";
import { IntegrasiPage } from "@/components/pages/IntegrasiPage";
import { initialLeads, type Lead, type Channel } from "@/lib/dummy-data";
import { toast } from "sonner";

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  overview: { title: "BTN CRM Modernization Demo", subtitle: "Ringkasan hubungan nasabah, lead KPR, tindak lanjut cabang, dan SLA layanan." },
  lead: { title: "Lead KPR", subtitle: "Pemantauan dan tindak lanjut prospek KPR lintas channel." },
  customer: { title: "Customer 360", subtitle: "Ringkasan hubungan nasabah dalam satu tampilan." },
  case: { title: "Case & SLA", subtitle: "Pengendalian SLA layanan, eskalasi, dan audit trail." },
  cabang: { title: "Performa Cabang", subtitle: "Pemantauan operasional cabang dan backlog tindak lanjut." },
  campaign: { title: "Campaign", subtitle: "Evaluasi efektivitas channel akuisisi." },
  laporan: { title: "Laporan", subtitle: "Insight ringkas pipeline, channel, dan SLA." },
  integrasi: { title: "Kesiapan Integrasi", subtitle: "Gambaran area integrasi secara non-teknis." },
};

const dummyNames = ["Putri Maharani", "Eko Saputra", "Lina Marlina", "Hadi Kurniawan", "Citra Dewi", "Bagas Pradana"];
const channels: Channel[] = ["balé Properti", "Cabang", "Call Center", "Developer", "Campaign"];
const branches = ["KC Jakarta", "KC Bekasi", "KC Bandung", "KC Tangerang", "KC Surabaya"];
const products = ["KPR Rumah Pertama", "KPR Subsidi", "Take Over KPR", "KPR Platinum"];

const Index = () => {
  const [page, setPage] = useState<PageKey>("overview");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");

  const handleAddLead = () => {
    const seq = leads.length + 1;
    const id = `LD-2026-${seq.toString().padStart(3, "0")}`;
    const newLead: Lead = {
      id,
      nama: dummyNames[seq % dummyNames.length],
      channel: channels[seq % channels.length],
      produk: products[seq % products.length],
      cabang: branches[seq % branches.length],
      pic: "Officer Demo",
      status: "Baru",
      sla: "Aman",
      followUp: "Baru saja",
      kota: branches[seq % branches.length].replace("KC ", ""),
    };
    setLeads((prev) => [newLead, ...prev]);
    toast.success("Lead dummy ditambahkan", { description: `${newLead.nama} · ${newLead.channel}` });
    if (page !== "lead") setPage("lead");
  };

  const meta = pageMeta[page];

  const content = useMemo(() => {
    switch (page) {
      case "overview": return <OverviewPage />;
      case "lead": return <LeadPage leads={leads} setLeads={setLeads} onAddLead={handleAddLead} globalSearch={search} />;
      case "customer": return <CustomerPage />;
      case "case": return <CasePage />;
      case "cabang": return <CabangPage />;
      case "campaign": return <CampaignPage />;
      case "laporan": return <LaporanPage />;
      case "integrasi": return <IntegrasiPage />;
    }
  }, [page, leads, search]);

  return (
    <AppShell
      current={page}
      onChange={setPage}
      onAddLead={handleAddLead}
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
