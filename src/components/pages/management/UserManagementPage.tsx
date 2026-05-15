import { useMemo, useState } from "react";
import { Users2, Plus, Upload, Download, Search, ShieldCheck, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { mgmtUsers, rolePermissions, branches } from "@/lib/dummy-data";
import { PageHero, PanelHeader } from "./_shared";

export function UserManagementPage() {
  const [role, setRole] = useState<"Semua" | "Senior Leader" | "Leader" | "RM">("Semua");
  const [branch, setBranch] = useState("Semua");
  const [status, setStatus] = useState<"Semua" | "Aktif" | "Nonaktif">("Semua");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => mgmtUsers.filter((u) =>
    (role === "Semua" || u.role === role) &&
    (branch === "Semua" || u.branch === branch) &&
    (status === "Semua" || u.status === status) &&
    (q === "" || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  ), [role, branch, status, q]);

  const allSelected = filtered.length > 0 && filtered.every((u) => selected.includes(u.id));
  const toggleAll = () => setSelected(allSelected ? selected.filter((id) => !filtered.find((u) => u.id === id)) : Array.from(new Set([...selected, ...filtered.map((u) => u.id)])));
  const toggleOne = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div className="space-y-5">
      <PageHero title="User & Role Management" subtitle="Direktori pengguna, role matrix, dan bulk action." badge="Khusus Senior Leader" />

      {/* Toolbar */}
      <div className="panel p-4 flex flex-wrap items-center gap-2">
        <Chip active={role === "Semua"} onClick={() => setRole("Semua")}>Semua Role</Chip>
        <Chip active={role === "Senior Leader"} onClick={() => setRole("Senior Leader")}>Senior Leader</Chip>
        <Chip active={role === "Leader"} onClick={() => setRole("Leader")}>Leader</Chip>
        <Chip active={role === "RM"} onClick={() => setRole("RM")}>RM</Chip>
        <span className="mx-1 h-5 w-px bg-border" />
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-input bg-background">
          <option value="Semua">Semua Cabang</option>
          {branches.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
          <option value="Head Office">Head Office</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="h-9 px-2 text-sm rounded-md border border-input bg-background">
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / email" className="h-9 pl-9 pr-3 text-sm rounded-lg border border-input bg-background w-56" />
        </div>
        <Button size="sm" className="bg-navy hover:bg-navy/90 text-navy-foreground" onClick={() => toast.success("Form tambah user dibuka")}><Plus className="h-4 w-4 mr-1.5" />Tambah User</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Import Excel dijalankan")}><Upload className="h-4 w-4 mr-1.5" />Import Excel</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Export directory tersimpan")}><Download className="h-4 w-4 mr-1.5" />Export Directory</Button>
      </div>

      {/* Bulk action */}
      {selected.length > 0 && (
        <div className="panel p-3 flex flex-wrap items-center gap-2 bg-gold-light/40 border-l-4 border-l-[hsl(var(--gold))]">
          <span className="text-sm font-semibold text-navy">{selected.length} terpilih</span>
          <span className="mx-1 h-5 w-px bg-border" />
          <Button size="sm" variant="outline" onClick={() => { toast.success("Status diubah"); setSelected([]); }}>Set Aktif/Nonaktif</Button>
          <Button size="sm" variant="outline" onClick={() => { toast.success("Role diubah"); setSelected([]); }}>Ubah Role</Button>
          <Button size="sm" variant="outline" onClick={() => { toast.success("Cabang dipindah"); setSelected([]); }}>Pindah Cabang</Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected([])}><X className="h-4 w-4 mr-1" />Batalkan</Button>
        </div>
      )}

      {/* Table */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold"><Users2 className="h-4 w-4" /></div>
          <div><h3 className="font-bold text-navy">Direktori User</h3><p className="text-xs text-muted-foreground">{filtered.length} dari {mgmtUsers.length} user.</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-10 pl-5"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th className="text-left px-3 py-3">Nama</th>
                <th className="text-left px-3 py-3">Role</th>
                <th className="text-left px-3 py-3">Cabang</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Last Login</th>
                <th className="text-left pr-5 py-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="pl-5 py-3"><input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleOne(u.id)} /></td>
                  <td className="px-3 py-3 font-medium text-navy">{u.name}</td>
                  <td className="px-3 py-3"><StatusBadge tone={u.role === "Senior Leader" ? "gold" : u.role === "Leader" ? "navy" : "blue"}>{u.role}</StatusBadge></td>
                  <td className="px-3 py-3 text-muted-foreground">{u.branch}</td>
                  <td className="px-3 py-3"><StatusBadge tone={u.status === "Aktif" ? "green" : "gray"}>{u.status}</StatusBadge></td>
                  <td className="px-3 py-3 text-muted-foreground">{u.lastLogin}</td>
                  <td className="pr-5 py-3 text-muted-foreground">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Role Matrix */}
      <section className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <PanelHeader title="Role Matrix" caption="Permission yang dimiliki tiap role." icon={ShieldCheck} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Permission</th>
                <th className="text-center px-3 py-3">Senior Leader</th>
                <th className="text-center px-3 py-3">Leader</th>
                <th className="text-center pr-5 py-3">RM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rolePermissions.map((p) => (
                <tr key={p.permission} className="hover:bg-muted/30">
                  <td className="px-5 py-3 text-navy">{p.permission}</td>
                  <td className="px-3 py-3 text-center"><PermIcon ok={p.management} /></td>
                  <td className="px-3 py-3 text-center"><PermIcon ok={p.leader} /></td>
                  <td className="pr-5 py-3 text-center"><PermIcon ok={p.rm} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PermIcon({ ok }: { ok: boolean }) {
  return ok ? <Check className="h-4 w-4 text-success inline" /> : <X className="h-4 w-4 text-muted-foreground inline" />;
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors", active ? "bg-navy text-navy-foreground border-navy" : "bg-card text-muted-foreground border-border hover:border-navy/40")}>{children}</button>
  );
}
