import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role, User } from "../types";
import {
  apiFetch,
  clearAuth,
  getCachedUser,
  getToken,
  setCachedUser,
  setToken,
} from "../lib/api-client";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  autoLoginDemo: (role: Role) => Promise<User>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

const DEMO_CREDS: Record<Role, { email: string; password: string }> = {
  farmer: { email: "ramesh@farmdirect.ai", password: "farm1234" },
  buyer: { email: "priya@farmdirect.ai", password: "buy1234" },
  admin: { email: "admin@farmdirect.ai", password: "admin1234" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCachedUser() as User | null);
  const [loading, setLoading] = useState(false);

  const refreshMe = useCallback(async () => {
    if (!getToken()) return;
    try {
      const me = await apiFetch<{ user: User }>("/v1/auth/me");
      setUser(me.user);
      setCachedUser(me.user);
    } catch {
      clearAuth();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user && getToken()) refreshMe().catch(() => {});
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: User }>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser(data.user);
      setCachedUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const autoLoginDemo = useCallback(async (role: Role) => {
    const creds = DEMO_CREDS[role];
    try {
      return await login(creds.email, creds.password);
    } catch (e) {
      const fallbackUser: User = {
        _id: "demo_" + role,
        role,
        name:
          role === "farmer"
            ? "Ramesh FPO (Demo Mode)"
            : role === "buyer"
              ? "Priya's Kitchen (Demo Mode)"
              : "Demo Admin",
        email: creds.email,
        location: { district: "Tiruppur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411 },
      };
      setToken("demo-token");
      setUser(fallbackUser);
      setCachedUser(fallbackUser);
      return fallbackUser;
    }
  }, [login]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, autoLoginDemo, logout, refreshMe }),
    [user, loading, login, autoLoginDemo, logout, refreshMe]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
