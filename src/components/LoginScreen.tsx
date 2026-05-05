import { useState } from "react";
import { ShieldCheck, Crown, UserRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActLogo } from "@/components/ActLogo";
import { useAuth, listAccounts, type SessionUser } from "@/lib/auth";

export function LoginScreen() {
  const { login } = useAuth();
  const accounts = listAccounts();
  const leaders = accounts.filter((a) => a.role === "leader");
  const rms = accounts.filter((a) => a.role === "rm");
  const [selected, setSelected] = useState<SessionUser>(leaders[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/30 to-gold-light/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl panel p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3">
          <ActLogo size="md" />
          <div>
            <div className="font-display text-lg font-bold text-navy tracking-tight">A.C.T Sales CRM</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Demo Login — Primera Karya Sinergia</div>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy bg-gold-light px-2.5 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--gold))]" /> Mode Demo
          </span>
        </div>

        <h2 className="mt-6 text-xl sm:text-2xl font-bold text-navy">Pilih akun untuk masuk demo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Demo memakai dua level akses: <span className="font-semibold text-navy">Sales Leader</span> melihat seluruh tim-nya,
          <span className="font-semibold text-navy"> Sales Team (RM)</span> hanya melihat data miliknya sendiri.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Section icon={Crown} title="Sales Leader" caption="Akses tim & coaching">
            {leaders.map((a) => (
              <Row key={a.name} active={selected.name === a.name && selected.role === "leader"} onClick={() => setSelected(a)} title={a.name} subtitle="Sales Leader" tone="gold" />
            ))}
          </Section>
          <Section icon={UserRound} title="Sales Team (RM)" caption="Akses data sendiri">
            {rms.map((a) => (
              <Row key={a.name} active={selected.name === a.name && selected.role === "rm"} onClick={() => setSelected(a)} title={a.name} subtitle={`RM · Leader ${a.leaderName}`} tone="blue" />
            ))}
          </Section>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between border-t border-border pt-5">
          <div className="text-xs text-muted-foreground">
            Terpilih: <span className="font-semibold text-navy">{selected.name}</span> ·{" "}
            <span className="capitalize">{selected.role === "leader" ? "Sales Leader" : "Sales Team (RM)"}</span>
          </div>
          <Button onClick={() => login(selected)} className="bg-navy hover:bg-navy/90 text-navy-foreground">
            Masuk sebagai akun ini <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, caption, children }: { icon: React.ComponentType<{ className?: string }>; title: string; caption: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-gold"><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-sm font-bold text-navy">{title}</div>
          <div className="text-[11px] text-muted-foreground">{caption}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Row({ active, onClick, title, subtitle, tone }: { active: boolean; onClick: () => void; title: string; subtitle: string; tone: "gold" | "blue" }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
        active ? "border-navy bg-card shadow-soft" : "border-border bg-card hover:border-navy/40"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${tone === "gold" ? "bg-[hsl(var(--gold))]" : "bg-primary"}`} />
        <div className="flex-1">
          <div className="text-sm font-semibold text-navy">{title}</div>
          <div className="text-[11px] text-muted-foreground">{subtitle}</div>
        </div>
        {active && <span className="text-[10px] font-semibold uppercase tracking-wider text-navy">Dipilih</span>}
      </div>
    </button>
  );
}