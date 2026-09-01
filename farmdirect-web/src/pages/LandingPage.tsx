import {
  ArrowRight,
  Bot,
  Leaf,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function LandingPage() {
  const nav = useNavigate();
  const { autoLoginDemo } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);

  const go = async (role: "farmer" | "buyer") => {
    setBusy(role);
    try {
      await autoLoginDemo(role);
      nav(role === "farmer" ? "/farmer/dashboard" : "/marketplace", { replace: true });
    } finally {
      setBusy(null);
    }
  };

  const features = [
    {
      icon: Sparkles,
      tone: "from-amber-100 to-amber-50",
      title: "Fair Price Recommendation",
      desc: "AI forecasts demand vs supply and tells farmers the right price to list — today for Tomato: ₹22 market → ₹25 recommended.",
    },
    {
      icon: Bot,
      tone: "from-brand-100 to-brand-50",
      title: "Demand Forecasting",
      desc: "Predict shortages before they happen. Tomato shortage of 220 kg this week? Plant more next cycle.",
    },
    {
      icon: Route,
      tone: "from-sky-100 to-sky-50",
      title: "Route Optimization",
      desc: "Bundle deliveries: 42 km total, 1h 25m ETA. 28% less distance than unoptimized stops.",
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Leaf size={20} />
            </span>
            <div className="leading-tight">
              <div className="text-base font-extrabold text-slate-900">Farm Direct AI</div>
              <div className="text-[11px] font-medium text-slate-500">
                Sell Direct · Buy Fresh · Deliver Smart
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
            <MapPin size={14} className="text-slate-400" />
            <span>Built for Tamil Nadu · Hackathon MVP</span>
          </div>
          <button onClick={() => nav("/login")} className="btn-ghost text-xs !py-2">
            Custom Login
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
              🌾 100% direct · No mandi middlemen
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              <span className="block text-brand-700">Sell Direct.</span>
              <span className="block mt-1">
                Buy <span className="text-amber-600">Fresh.</span>
              </span>
              <span className="block mt-1">
                Deliver <span className="text-sky-600">Smart.</span>
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              Farm Direct AI connects <b>Farmers & FPOs</b> directly with <b>Buyers</b>,
              backed by an AI engine that recommends fair prices, predicts crop demand, and
              optimizes multi-stop delivery routes end-to-end.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                disabled={busy !== null}
                onClick={() => go("farmer")}
                className="btn-primary !py-3.5 !px-6 !text-base group"
              >
                👨‍🌾 I'm a Farmer
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                <span className="ml-1 text-xs font-semibold text-brand-100">
                  {busy === "farmer" ? "Logging in…" : "Demo login"}
                </span>
              </button>
              <button
                disabled={busy !== null}
                onClick={() => go("buyer")}
                className="btn-ghost !py-3.5 !px-6 !text-base group border border-slate-300 hover:border-slate-400"
              >
                🛒 I'm a Buyer
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                <span className="ml-1 text-xs font-semibold text-slate-500">
                  {busy === "buyer" ? "Logging in…" : "Demo login"}
                </span>
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-brand-600" /> Bcrypt + JWT auth
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck size={14} className="text-sky-600" /> Haversine + 2-opt routes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bot size={14} className="text-amber-600" /> Scikit-learn forecasts
              </span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-200 via-amber-100 to-sky-100 opacity-60 blur-2xl" />
              <div className="relative card overflow-hidden p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="badge bg-brand-50 text-brand-700 border border-brand-200">
                    🍅 Tomato · Live snapshot
                  </span>
                  <span className="badge bg-orange-100 text-orange-700 border border-orange-200">
                    🔥 Demand HIGH
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-5xl leading-none">🍅</div>
                    <div className="mt-2 text-sm font-semibold text-slate-500">
                      Ramesh FPO · Tiruppur
                    </div>
                    <div className="text-lg font-extrabold text-slate-900">500 kg listed</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-400">AI Recommended</div>
                    <div className="text-4xl font-extrabold text-brand-700">₹25<span className="text-lg text-slate-400">/kg</span></div>
                    <div className="text-[11px] font-bold text-amber-700 mt-1">+13.6% vs market</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Market</div>
                    <div className="mt-1 font-extrabold text-slate-700">₹22</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Supply</div>
                    <div className="mt-1 font-extrabold text-slate-700">500 kg</div>
                  </div>
                  <div className="rounded-xl bg-brand-50 p-3">
                    <div className="text-[10px] uppercase font-bold text-brand-600">Demand</div>
                    <div className="mt-1 font-extrabold text-brand-800">720 kg</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-sky-700" />
                    <div className="leading-tight">
                      <div className="font-extrabold text-sky-900">Optimized route</div>
                      <div className="text-xs text-sky-700">42 km · 1h 25m ETA</div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-bold text-sky-700">
                    🟢 Saved 28%<br />distance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Your marketplace, powered by three AIs.
        </h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card relative overflow-hidden p-6">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.tone} opacity-50`}
              />
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                  <f.icon size={22} className="text-slate-800" />
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-slate-500">
          © Farm Direct AI · Hackathon MVP · React + Node + Python + MongoDB
        </div>
      </footer>
    </div>
  );
}
