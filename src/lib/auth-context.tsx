import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthUser { email: string; }
interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "groundwork:auth";
const USERS = "groundwork:users";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };

  const getUsers = (): Record<string, string> => {
    try { return JSON.parse(localStorage.getItem(USERS) || "{}"); } catch { return {}; }
  };

  const signUp = async (email: string, password: string) => {
    const users = getUsers();
    if (users[email]) throw new Error("Account already exists for this email");
    users[email] = password;
    localStorage.setItem(USERS, JSON.stringify(users));
    persist({ email });
  };

  const signIn = async (email: string, password: string) => {
    const users = getUsers();
    if (!users[email]) throw new Error("No account found. Sign up first.");
    if (users[email] !== password) throw new Error("Incorrect password");
    persist({ email });
  };

  const signOut = () => persist(null);

  return <Ctx.Provider value={{ user, ready, signUp, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
