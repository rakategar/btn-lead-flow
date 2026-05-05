import { useState } from "react";
import { ShieldCheck, Crown, UserRound, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActLogo } from "@/components/ActLogo";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  { role: "leader" as const, name: "Andre Wibowo", email: "andre.wibowo@btn.demo", subtitle: "Sales Leader" },
  { role: "rm" as const, name: "Rina A.", leaderName: "Andre Wibowo", email: "rina.a@btn.demo", subtitle: "Sales Team (RM) · Tim Andre Wibowo" },
];

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!acc || !password) {
      toast.error("Email atau password tidak dikenali", {
        description: "Gunakan tombol Quick Demo Login di bawah untuk masuk demo.",
      });
      return;
    }
    login({ role: acc.role, name: acc.name, leaderName: acc.leaderName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/30 to-gold-light/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3">
          <ActLogo size="md" />
          <div>
            <div className="font-display text-lg font-bold text-navy tracking-tight">A.C.T Sales CRM</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Banking Sales Command Center</div>
          </div>
        </div>

        {/* Sign in card */}
        <div className="panel p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your command center.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy bg-gold-light px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--gold))]" /> Demo
            </span>
          </div>

          <form onSubmit={handleSignIn} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-navy">Email</Label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="nama@btn.demo" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-navy">Password</Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-navy hover:bg-navy/90 text-navy-foreground">
              Sign in <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        </div>

        {/* Quick demo login */}
        <div className="panel p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quick Demo Login</div>
            <span className="text-[10px] font-medium text-muted-foreground">Klik untuk langsung masuk</span>
          </div>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.role === "leader" ? Crown : UserRound;
              return (
                <button
                  key={acc.email}
                  onClick={() => login({ role: acc.role, name: acc.name, leaderName: acc.leaderName })}
                  className="w-full text-left rounded-lg border border-border bg-card hover:border-navy/50 hover:shadow-soft transition-all px-3 py-2.5 flex items-center gap-3 group"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${acc.role === "leader" ? "bg-navy text-gold" : "bg-primary-light text-primary"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-navy">{acc.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{acc.subtitle}</div>
                  </div>
                  <span className="text-[11px] text-muted-foreground hidden sm:block">{acc.email}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Data demo. Kontrol siap perbankan dengan dua level akses.</p>
        </div>
      </div>
    </div>
  );
}
