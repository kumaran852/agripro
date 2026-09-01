import { useState } from "react";
import { Leaf } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageShell } from "../components/layout/Navbar";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/marketplace";
  const [email, setEmail] = useState("ramesh@farmdirect.ai");
  const [password, setPassword] = useState("farm1234");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const u = await login(email, password);
      nav(u.role === "farmer" ? "/farmer/dashboard" : next, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const presets = [
    { label: "Farmer", email: "ramesh@farmdirect.ai", pwd: "farm1234", tone: "brand" },
    { label: "Buyer", email: "priya@farmdirect.ai", pwd: "buy1234", tone: "sky" },
    { label: "Admin", email: "admin@farmdirect.ai", pwd: "admin1234", tone: "amber" },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <Leaf size={26} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Log in to continue to Farm Direct AI
          </p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@farmdirect.ai"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {err && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
              {err}
            </div>
          )}
          <button className="btn-primary w-full !py-3" disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
          <div className="pt-2">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Demo quick presets
            </div>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setEmail(p.email);
                    setPassword(p.pwd);
                  }}
                  className={`rounded-xl border p-2 text-xs font-bold transition hover:shadow-sm ${
                    p.tone === "brand"
                      ? "border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100"
                      : p.tone === "sky"
                        ? "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"
                        : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Link
            to="/"
            className="mt-1 block text-center text-xs font-semibold text-slate-500 hover:text-brand-700"
          >
            ← Back to landing
          </Link>
        </form>
      </div>
    </PageShell>
  );
}
