import { useState } from "react";
import { Building2, Target, Clock, Brain, ChevronRight, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { orgTree, branches, productKpis, fuRules, aiFeatureToggles, type OrgNode } from "@/lib/dummy-data";
import { PageHero } from "./_shared";

type Tab = "branch" | "target" | "fu" | "ai";

export function SystemConfigPage() {
  const [tab, setTab] = useState<Tab>("branch");

  return (
    <div className="space-y-5">
      <PageHero title="System Configuration" subtitle="Konfigurasi cabang, target, rules follow-up, dan AI." badge="Khusus Senior Leader" />

      <div className="flex flex-wrap items-center gap-2">
        <TabBtn active={tab === "branch"} onClick={() => setTab("branch")} icon={Building2}>Cabang & Area</TabBtn>
        <TabBtn active={tab === "target"} onClick={() => setTab("target")} icon={Target}>Target Cabang</TabBtn>
        <TabBtn active={tab === "fu"}     onClick={() => setTab("fu")}     icon={Clock}>Rules Follow-Up</TabBtn>
        <TabBtn active={tab === "ai"}     onClick={() => setTab("ai")}     icon={Brain}>Konfigurasi AI</TabBtn>
      </div>

      {tab === "branch" && <BranchTreeTab />}
      {tab === "target" && <TargetTab />}
      {tab === "fu"     && <FuTab />}
      {tab === "ai"     && <AiTab />}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, children }: { active?: boolean; onClick?: () => void; icon: any; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors", active ? "bg-navy text-navy-foreground border-navy" : "bg-card text-muted-foreground border-border hover:border-navy/40")}>
      <Icon className="h-3.5 w-3.5" />{children}
    </button>
  );
}

function BranchTreeTab() {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-bold text-navy">Struktur National → Region → Area → Branch</h3><p className="text-xs text-muted-foreground">Kelola hierarki cabang.</p></div>
        <Button size="sm" className="bg-navy hover:bg-navy/90 text-navy-foreground" onClick={() => toast.success("Form tambah node")}><Plus className="h-4 w-4 mr-1" />Tambah Node</Button>
      </div>
      <TreeNode node={orgTree} depth={0} />
    </section>
  );
}

function TreeNode({ node, depth }: { node: OrgNode; depth: number }) {
  const hasChildren = !!node.children?.length;
  return (
    <Collapsible defaultOpen={depth < 2}>
      <div className="flex items-center gap-2 py-1.5" style={{ paddingLeft: depth * 16 }}>
        {hasChildren ? (
          <CollapsibleTrigger className="p-0.5 hover:bg-muted rounded text-muted-foreground"><ChevronRight className="h-4 w-4 transition-transform [data-state=open]:rotate-90" /></CollapsibleTrigger>
        ) : <span className="w-5" />}
        <span className={cn("text-sm font-medium", depth === 0 ? "text-navy font-bold" : "text-navy")}>{node.name}</span>
        <div className="ml-auto flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
          <button className="p-1 rounded hover:bg-muted text-muted-foreground" onClick={() => toast.success("Edit node")}><Pencil className="h-3 w-3" /></button>
          <button className="p-1 rounded hover:bg-danger-light text-muted-foreground hover:text-danger" onClick={() => toast.success("Hapus node")}><Trash2 className="h-3 w-3" /></button>
        </div>
      </div>
      {hasChildren && (
        <CollapsibleContent>
          {node.children!.map((c) => <TreeNode key={c.name} node={c} depth={depth + 1} />)}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

function TargetTab() {
  return (
    <section className="panel overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div><h3 className="font-bold text-navy">Target per Cabang per Produk</h3><p className="text-xs text-muted-foreground">Periode bulan berjalan (juta Rupiah).</p></div>
        <Button size="sm" variant="outline" onClick={() => toast.success("Import Excel target")}><Upload className="h-4 w-4 mr-1.5" />Import Excel</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3">Cabang</th>
              {productKpis.map((p) => <th key={p.name} className="text-right px-3 py-3">{p.name}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {branches.map((b, bi) => (
              <tr key={b.name}>
                <td className="px-5 py-3 font-medium text-navy">{b.name}</td>
                {productKpis.map((p) => (
                  <td key={p.name} className="px-3 py-2 text-right">
                    <input type="number" defaultValue={Math.round(p.target / branches.length) + bi * 50} className="w-24 h-8 px-2 text-right text-sm rounded-md border border-input bg-background" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FuTab() {
  return (
    <section className="panel p-5">
      <h3 className="font-bold text-navy">Rules Follow-Up</h3>
      <p className="text-xs text-muted-foreground">Timeline FU1/FU2/FU3 dan SLA overdue.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "fu1", label: "FU1 (hari)",         val: fuRules.fu1 },
          { key: "fu2", label: "FU2 (hari)",         val: fuRules.fu2 },
          { key: "fu3", label: "FU3 (hari)",         val: fuRules.fu3 },
          { key: "sla", label: "SLA Overdue (hari)", val: fuRules.slaOverdue },
        ].map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-muted-foreground">{f.label}</span>
            <input type="number" defaultValue={f.val} className="mt-1 w-full h-9 px-3 text-sm rounded-md border border-input bg-background" />
          </label>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button className="bg-navy hover:bg-navy/90 text-navy-foreground" onClick={() => toast.success("Rules disimpan")}>Simpan Perubahan</Button>
      </div>
    </section>
  );
}

function AiTab() {
  const [features, setFeatures] = useState(aiFeatureToggles);
  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <h3 className="font-bold text-navy">Fitur AI</h3>
        <p className="text-xs text-muted-foreground">Aktifkan atau matikan fitur AI tertentu.</p>
        <div className="mt-4 space-y-2">
          {features.map((f, i) => (
            <div key={f.key} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="text-sm font-medium text-navy">{f.label}</div>
              <Switch checked={f.enabled} onCheckedChange={(v) => {
                setFeatures((arr) => arr.map((x, idx) => idx === i ? { ...x, enabled: v } : x));
                toast.success(`${f.label} ${v ? "diaktifkan" : "dimatikan"}`);
              }} />
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <h3 className="font-bold text-navy">Template & Guardrail</h3>
        <p className="text-xs text-muted-foreground">Atur template prompt dan batasan output AI.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Template AI Executive Summary</span>
            <textarea rows={5} defaultValue={"Ringkas situasi pipeline, key issues, area perbaikan, dan area yang harus dipertahankan dalam 3-5 poin per bagian."} className="mt-1 w-full text-sm rounded-md border border-input bg-background p-3" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Guardrail</span>
            <textarea rows={5} defaultValue={"Hindari menyebut data nasabah individual. Fokus pada agregat cabang. Jangan memberi rekomendasi finansial spesifik."} className="mt-1 w-full text-sm rounded-md border border-input bg-background p-3" />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="bg-navy hover:bg-navy/90 text-navy-foreground" onClick={() => toast.success("Template & guardrail disimpan")}>Simpan</Button>
        </div>
      </section>
    </div>
  );
}
