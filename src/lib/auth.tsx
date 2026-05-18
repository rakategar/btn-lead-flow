import { createContext, useContext, useState, ReactNode } from "react";
import { leaders } from "@/lib/dummy-data";

export type Role = "leader" | "rm" | "management";

export interface SessionUser {
  role: Role;
  /** Untuk leader: nama leader. Untuk RM: nama RM. */
  name: string;
  /** Untuk RM: nama leader yang membawahi. */
  leaderName?: string;
}

interface AuthCtx {
  user: SessionUser | null;
  login: (u: SessionUser) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  return (
    <Ctx.Provider value={{ user, login: setUser, logout: () => setUser(null) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

/** Daftar akun dummy untuk login picker. */
export function listAccounts(): SessionUser[] {
  const accounts: SessionUser[] = [
    { role: "management", name: "Kadiv/Kadep" },
  ];
  for (const l of leaders) {
    accounts.push({ role: "leader", name: l.name });
    for (const rm of l.rms) {
      accounts.push({ role: "rm", name: rm, leaderName: l.name });
    }
  }
  return accounts;
}