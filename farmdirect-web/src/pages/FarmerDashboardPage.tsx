import { Plus, Package2, ShoppingBag, Wallet, TrendingUp, Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "../components/layout/Navbar";
import { StatCard } from "../components/cards/StatCard";
import { OrderCard } from "../components/cards/OrderCard";
import { AiDemandBadge } from "../components/widgets/AiDemandBadge";
import { PriceComparator } from "../components/widgets/PriceComparator";
import { AddProductModal } from "../components/forms/AddProductModal";
import { useApi, useMutation } from "../hooks/useApi";
import type { Forecast, Order, Product } from "../types";
import { cropLabel, formatINR, formatKg } from "../lib/formatters";
import { apiFetch } from "../lib/api-client";
import { useAuth } from "../context/AuthContext";

export default function FarmerDashboardPage() {
  const { user, refreshMe } = useAuth();
  const [openAdd, setOpenAdd] = useState(false);

  const {
    data: orders,
    loading: oLoad,
    refresh: refreshOrders,
  } = useApi<Order[]>("/v1/orders?role=farmer", {
    auto: true,
  });
  const { data: productsRaw, loading: pLoad, refresh: refreshProducts } = useApi<{
    items: Product[];
    pagination: any;
  }>("/v1/products?limit=50", { auto: true });

  const { data: forecasts } = useApi<Forecast[]>("/v1/forecast/batch?crops=tomato,potato,onion,brinjal,ladiesfinger", {
    auto: true,
  });

  const products = productsRaw?.items || [];
  const myProducts = products.filter((p) => {
    const fid = typeof p.farmerId === "object" ? (p.farmerId as any)?._id : p.farmerId;
    return fid === (user as any)?.profile?._id || user?.role === "admin";
  });

  const revenue = useMemo(() => {
    return (orders || [])
      .filter((o) => ["DELIVERED", "ACCEPTED", "IN_TRANSIT"].includes(o.status))
      .reduce((a, b) => a + b.totalAmount, 0);
  }, [orders]);

  const pendingOrders = (orders || []).filter((o) => o.status === "PENDING");
  const latestOrder = (orders || [])[0];
  const topForecast = (forecasts || []).reduce(
    (a, b) => (b.demandRatio > a.demandRatio ? b : a),
    forecasts?.[0] || (null as unknown as Forecast)
  );

  const { exec: accept, loading: accepting } = useMutation(async (id: string) => {
    return apiFetch(`/v1/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "ACCEPTED" }),
    });
  });

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-brand-700">
            👨‍🌾 Farmer Dashboard
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Namaskaram, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage produce, track orders, and follow AI recommendations.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => refreshMe()}>
            <Bell size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setOpenAdd(true)}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Package2}
          label="Products Listed"
          value={pLoad ? "…" : String(myProducts.length || products.length)}
          tone="green"
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders Received"
          value={oLoad ? "…" : String(orders?.length || 0)}
          delta={`${pendingOrders.length} pending`}
          tone="amber"
        />
        <StatCard
          icon={Wallet}
          label="Revenue (Confirmed)"
          value={oLoad ? "…" : formatINR(revenue || (user as any)?.profile?.totalRevenue || 24500)}
          tone="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Rating"
          value="4.6 ★"
          delta="+0.2 this week"
          tone="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Recent orders</h2>
                <p className="text-xs text-slate-500">
                  Latest {(orders || []).slice(0, 3).length} from buyers
                </p>
              </div>
              {pendingOrders.length > 0 && (
                <span className="badge bg-amber-100 text-amber-800 border border-amber-200">
                  🔔 {pendingOrders.length} new
                </span>
              )}
            </div>
            {oLoad ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {(orders || []).slice(0, 4).map((o) => (
                  <div key={o._id} className="relative">
                    <OrderCard order={o} />
                    {o.status === "PENDING" && (
                      <div className="absolute right-4 top-4 z-10">
                        <button
                          disabled={accepting}
                          onClick={async () => {
                            try {
                              await accept(o._id);
                              await refreshOrders();
                            } catch {}
                          }}
                          className="btn-primary !py-1.5 !px-3 text-xs"
                        >
                          ✓ Accept
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {(orders || []).length === 0 && (
                  <div className="col-span-2 rounded-xl border-2 border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                    No orders yet. Add a product first!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-lg font-extrabold text-slate-900">My Products</h2>
            <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Produce</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">AI Signal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(myProducts.length ? myProducts : products).slice(0, 8).map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.emoji}</span>
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500">
                              {cropLabel(p.crop)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {formatKg(p.quantityKg)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {formatINR(p.pricePerKg)}
                        <span className="ml-1 text-xs font-medium text-slate-400">/kg</span>
                      </td>
                      <td className="px-4 py-3">
                        <AiDemandBadge level={p.aiDemandLevel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-5 py-4 border-b border-amber-200/70">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  ✨ AI Recommendation
                </div>
                <span className="badge bg-orange-100 text-orange-700 border border-orange-200">
                  {topForecast ? `${cropLabel(topForecast.crop)} ↑ ${(((topForecast.demandRatio - 1) * 100).toFixed(0))}%` : "Loading…"}
                </span>
              </div>
            </div>
            <div className="p-5">
              {topForecast ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-4xl ring-1 ring-slate-200">
                      {cropLabel(topForecast.crop) === "Tomato"
                        ? "🍅"
                        : cropLabel(topForecast.crop) === "Potato"
                          ? "🥔"
                          : cropLabel(topForecast.crop) === "Onion"
                            ? "🧅"
                            : "🥬"}
                    </span>
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {cropLabel(topForecast.crop)} demand rising
                      </div>
                      <div className="text-xs text-slate-500">
                        Predicted demand {formatKg(topForecast.predictedDemandKg)} vs supply{" "}
                        {formatKg(topForecast.currentSupplyKg)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <PriceComparator
                      baseline={topForecast.baselineMarketPrice}
                      recommended={topForecast.recommendedPrice}
                    />
                  </div>
                  <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">
                    <b>Verdict:</b> 🟢{" "}
                    {topForecast.sellVerdict === "GOOD"
                      ? "Good time to sell — list at AI price."
                      : topForecast.sellVerdict === "HOLD"
                        ? "Consider holding; market is oversupplied."
                        : "Hold steady at current price."}
                  </div>
                </>
              ) : (
                <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-500">
              🔔 Latest Activity
            </h3>
            {latestOrder ? (
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="font-bold text-slate-900">New Order: {latestOrder.shortId}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Buyer ordered{" "}
                  <b className="text-slate-700">
                    {formatKg(latestOrder.quantityKg)}
                  </b>{" "}
                  for {formatINR(latestOrder.totalAmount)}
                </div>
                <div className="mt-2 text-xs">
                  <span
                    className={`badge ${
                      latestOrder.status === "PENDING"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-brand-50 text-brand-700 border border-brand-200"
                    }`}
                  >
                    {latestOrder.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">No activity yet.</div>
            )}
          </div>
        </aside>
      </div>

      <AddProductModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={async () => {
          await refreshProducts();
          await refreshMe();
        }}
      />
    </PageShell>
  );
}
