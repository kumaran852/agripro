import { Leaf, LogOut, Sparkles, Truck, Store, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const itemCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-xl text-sm font-medium transition ${
    isActive
      ? "bg-brand-50 text-brand-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;

  const roleHint =
    user.role === "farmer"
      ? "🌾 Farmer"
      : user.role === "buyer"
        ? "🛒 Buyer"
        : "⚙️ Admin";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Leaf size={18} />
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight text-slate-900">
              Farm Direct AI
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Sell Direct · Buy Fresh · Deliver Smart
            </div>
          </div>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <NavLink to="/marketplace" end className={itemCls}>
            <span className="inline-flex items-center gap-1.5">
              <Store size={16} /> Marketplace
            </span>
          </NavLink>
          {user.role === "farmer" && (
            <NavLink to="/farmer/dashboard" className={itemCls}>
              <span className="inline-flex items-center gap-1.5">
                <User size={16} /> My Dashboard
              </span>
            </NavLink>
          )}
          <NavLink to="/ai" className={itemCls}>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={16} /> AI Insights
            </span>
          </NavLink>
          <NavLink to="/logistics" className={itemCls}>
            <span className="inline-flex items-center gap-1.5">
              <Truck size={16} /> Logistics
            </span>
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 sm:inline-flex">
            {roleHint}
          </span>
          <span className="hidden truncate text-sm font-medium text-slate-700 sm:inline">
            {user.name}
          </span>
          <button
            onClick={() => {
              logout();
              nav("/", { replace: true });
            }}
            className="btn-ghost !py-2 !px-3 text-xs"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <Navbar />
      <main className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </main>
    </>
  );
}
