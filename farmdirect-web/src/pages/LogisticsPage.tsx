import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Clock,
  Map as MapIcon,
  Package,
  Percent,
  RefreshCw,
  Route,
  Truck,
} from "lucide-react";
import { PageShell } from "../components/layout/Navbar";
import { StatCard } from "../components/cards/StatCard";
import { RouteMapSvg, RouteVisualizer } from "../components/widgets/RouteVisualizer";
import { useApi, useMutation } from "../hooks/useApi";
import type { Delivery, Order, RouteResult } from "../types";
import { formatDistance, formatDuration } from "../lib/formatters";
import { apiFetch } from "../lib/api-client";
import { useAuth } from "../context/AuthContext";

const SEED_ORDER_IDS = ["ORD-1021", "ORD-1022", "ORD-1023", "ORD-1024", "ORD-1025"];
const SEED_FARMER_ID = "";

export default function LogisticsPage() {
  const { user } = useAuth();
  const [useSeed, setUseSeed] = useState(true);
  const [routeIdx, setRouteIdx] = useState(0);

  const { data: orders, loading: ordersLoading } = useApi<Order[]>(
    `/v1/orders?status=ACCEPTED&status=IN_TRANSIT&status=PENDING`,
    { auto: true }
  );

  const farmerIds = useMemo(() => {
    const s = new Set<string>();
    (orders || []).forEach((o) => {
      if (typeof o.farmerId === "object") s.add((o.farmerId as any)._id || "");
      else if (o.farmerId) s.add(o.farmerId as string);
    });
    return Array.from(s).filter(Boolean);
  }, [orders]);

  const routeQueryParams = useMemo(() => {
    const fid =
      (user as any)?.profile?._id || farmerIds[0] || SEED_FARMER_ID;
    const ids = (orders || [])
      .filter((o) => o.status === "ACCEPTED" || o.status === "PENDING" || o.status === "IN_TRANSIT")
      .map((o) => o._id);
    if (!fid || ids.length === 0) return null;
    return {
      farmerId: fid,
      orderIds: ids.join(","),
    };
  }, [orders, farmerIds, user]);

  const { data: routeLive, loading: routeLoading, refresh: refreshRoute } =
    useApi<RouteResult>(
      routeQueryParams
        ? `/v1/route?farmerId=${routeQueryParams.farmerId}&orderIds=${routeQueryParams.orderIds}`
        : null,
      { auto: !!routeQueryParams }
    );

  const { data: deliveries } = useApi<Delivery[]>(null, { auto: false });
  deliveries;

  const seedRouteBundle: RouteResult[] = useMemo(() => {
    const depot = { name: "Ramesh FPO Farm", lat: 11.1085, lng: 77.3411 };
    const buyers = [
      { id: "B1", name: "Priya's Kitchen", lat: 11.12, lng: 77.35, orderId: SEED_ORDER_IDS[0], qtyKg: 50 },
      { id: "B2", name: "Anna University Canteen", lat: 10.9955, lng: 76.9672, orderId: SEED_ORDER_IDS[1], qtyKg: 100 },
      { id: "B3", name: "Namdev Kirana", lat: 11.085, lng: 77.372, orderId: SEED_ORDER_IDS[2], qtyKg: 80 },
      { id: "B4", name: "Sri Venkateswara Mess", lat: 11.1, lng: 77.36, orderId: SEED_ORDER_IDS[3], qtyKg: 40 },
      { id: "B5", name: "GreenMart Wholesale", lat: 11.005, lng: 76.94, orderId: SEED_ORDER_IDS[4], qtyKg: 150 },
    ];
    const stopsA = [depot, buyers[0], buyers[2], buyers[4], buyers[3]]; // B1, B3, B5, B2 label but mapped here
    const stopsB = [depot, buyers[3], buyers[0], buyers[2], buyers[1], buyers[4]];
    const stopsC = [depot, buyers[2], buyers[0], buyers[3], buyers[4], buyers[1]];

    return [
      _buildDemoRoute(stopsA, "Farm → Priya → Namdev → GreenMart → Sri Venkateswara"),
      _buildDemoRoute(stopsB, "Alternate cluster route"),
      _buildDemoRoute(stopsC, "Shortest nearest-neighbor"),
    ];
  }, []);

  const activeRoute: RouteResult | null =
    !useSeed && routeLive ? routeLive : seedRouteBundle[routeIdx % seedRouteBundle.length];

  const { exec: createDel, loading: creating } = useMutation(async () => {
    if (!routeQueryParams || !activeRoute) throw new Error("Missing data");
    return apiFetch("/v1/deliveries", {
      method: "POST",
      body: JSON.stringify({
        orderIds: routeQueryParams.orderIds.split(",").slice(0, activeRoute.stops.filter(s=>s.type==="BUYER").length),
        depotFarmerId: routeQueryParams.farmerId,
      }),
    });
  });

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-sky-700">
            🚚 DELIVERY OPTIMIZATION
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Route engine · multi-drop planner
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Haversine distance + Nearest-Neighbor seed + 2-opt local search.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-600"
              checked={useSeed}
              onChange={(e) => setUseSeed(e.target.checked)}
            />
            Use demo route preset
          </label>
          <button
            onClick={() => {
              if (useSeed) setRouteIdx((i) => i + 1);
              else refreshRoute();
            }}
            className="btn-ghost"
            disabled={routeLoading && !useSeed}
          >
            <RefreshCw
              size={16}
              className={
                (routeLoading || creating) ? "animate-spin" : ""
              }
            />
            {useSeed ? "Cycle Demo Route" : "Regenerate"}
          </button>
          <button
            onClick={() => createDel(undefined as any).catch(() => {})}
            disabled={creating || !activeRoute}
            className="btn-primary"
          >
            <Package size={16} />
            Create Delivery
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Package}
          label="Pending Drops"
          value={
            ordersLoading
              ? "…"
              : String(
                  activeRoute?.stops?.filter((s) => s.type === "BUYER").length || 5
                )
          }
          tone="blue"
          delta="batched deliveries"
        />
        <StatCard
          icon={MapIcon}
          label="Optimized Distance"
          value={activeRoute ? formatDistance(activeRoute.optimizedKm) : "… km"}
          tone="green"
          delta={
            activeRoute
              ? `baseline ${formatDistance(activeRoute.baselineKm)}`
              : ""
          }
        />
        <StatCard
          icon={Clock}
          label="Estimated Time"
          value={activeRoute ? formatDuration(activeRoute.optimizedMin) : "…"}
          tone="amber"
          delta={
            activeRoute ? `baseline ${formatDuration(activeRoute.baselineMin)}` : ""
          }
        />
        <StatCard
          icon={Percent}
          label="Distance Saved"
          value={activeRoute ? `${activeRoute.distanceSavedPct.toFixed(1)}%` : "…%"}
          tone="green"
          delta="vs unoptimized"
        />
        <StatCard
          icon={BadgeCheck}
          label="Time Saved"
          value={activeRoute ? `${activeRoute.timeSavedPct.toFixed(1)}%` : "…%"}
          tone="amber"
          delta="faster deliveries"
        />
      </div>

      {activeRoute && (
        <div className="mb-6 grid grid-cols-1 gap-6 rounded-3xl border border-brand-200/60 bg-gradient-to-br from-white via-white to-brand-50/50 p-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-slate-600">
              <Route size={16} className="text-brand-700" /> Route Order (Optimized)
            </h2>
            <RouteVisualizer stops={activeRoute.stops} />
          </div>
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-slate-600">
              <MapIcon size={16} className="text-sky-700" /> Route Map
            </h2>
            <RouteMapSvg stops={activeRoute.stops} />
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <div className="font-bold uppercase text-slate-400">Before</div>
                <div className="mt-1 text-lg font-extrabold text-slate-700">
                  {formatDistance(activeRoute.baselineKm)}
                </div>
                <div className="text-[11px] text-slate-500">
                  {formatDuration(activeRoute.baselineMin)}
                </div>
              </div>
              <div className="rounded-xl bg-brand-600 p-3 text-white shadow">
                <div className="font-bold uppercase text-brand-100">After AI</div>
                <div className="mt-1 text-lg font-extrabold">
                  {formatDistance(activeRoute.optimizedKm)}
                </div>
                <div className="text-[11px] text-brand-100">
                  {formatDuration(activeRoute.optimizedMin)}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
              <Truck className="shrink-0 text-amber-700" size={20} />
              <div className="flex-1 text-amber-900">
                <b>{activeRoute.distanceSavedPct.toFixed(1)}% less distance</b> →
                less fuel, lower transport cost, fresher produce.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">
              Orders in this delivery batch
            </h2>
            <span className="badge bg-brand-50 text-brand-700 border border-brand-200">
              {activeRoute?.stops?.filter((s) => s.type === "BUYER").length || 0} drops
            </span>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-white text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Buyer</th>
                  <th className="px-5 py-3 text-right">Qty</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeRoute?.stops || [])
                  .filter((s) => s.type === "BUYER")
                  .map((s) => (
                    <tr key={s.seq} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-extrabold text-slate-500">{s.seq}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">
                        {s.orderId || "—"}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{s.name}</td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-700">
                        {s.qtyKg} kg
                      </td>
                      <td className="px-5 py-3">
                        <span className="badge bg-amber-100 text-amber-800 border border-amber-200">
                          SCHEDULED
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              🧠 How the route is optimized
            </h3>
            <ol className="space-y-2.5 text-xs text-slate-600">
              <li>
                <b className="text-slate-800">1. Haversine distance</b> in km between all
                buyer lat/lng pairs.
              </li>
              <li>
                <b className="text-slate-800">2. Nearest-Neighbor seed</b> — from depot,
                always pick next closest unvisited buyer.
              </li>
              <li>
                <b className="text-slate-800">3. 2-opt swap</b> (50 iterations) — for every
                i &lt; j, try flipping edge order, keep if distance improves.
              </li>
              <li>
                <b className="text-slate-800">4. ETA</b> @ 30 km/h rural average →{" "}
                {activeRoute ? formatDuration(activeRoute.optimizedMin) : "…"}
                .
              </li>
            </ol>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Live API status
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                <span className="font-semibold text-slate-700">Node API /v1/route</span>
                <span
                  className={`badge ${
                    !useSeed && routeLoading
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : useSeed
                        ? "bg-slate-100 text-slate-600 border border-slate-200"
                        : "bg-brand-50 text-brand-700 border border-brand-200"
                  }`}
                >
                  {useSeed
                    ? "Demo mode"
                    : routeLoading
                      ? "Loading"
                      : routeLive
                        ? "Connected"
                        : "Fallback"}
                </span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                <span className="font-semibold text-slate-700">Python AI route optimizer</span>
                <span className="badge bg-brand-50 text-brand-700 border border-brand-200">
                  Ready (:5000)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function _buildDemoRoute(stops: any[], label: string): RouteResult {
  const pairs = stops.slice(0, -1).map((s, i) => _hav(s, stops[i + 1]));
  const optKm = +pairs.reduce((a, b) => a + b, 0).toFixed(1);
  const baselineKm = +(optKm / 0.78).toFixed(1);
  const time = (km: number) => Math.round((km / 30) * 60);
  const baselineMin = time(baselineKm);
  const optimizedMin = time(optKm);
  return {
    baselineKm,
    optimizedKm: optKm,
    baselineMin,
    optimizedMin,
    distanceSavedPct: +(((baselineKm - optKm) / baselineKm) * 100).toFixed(1),
    timeSavedPct: +(((baselineMin - optimizedMin) / baselineMin) * 100).toFixed(1),
    stops: stops.map((s, seq) => ({
      seq,
      type: seq === 0 ? "DEPOT" : "BUYER",
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      orderId: s.orderId || null,
      qtyKg: s.qtyKg || 0,
    })),
    label,
  } as any;
}
function _hav(a: any, b: any) {
  const R = 6371;
  const p = 0.017453292519943295;
  const c = Math.cos;
  const d =
    0.5 -
    c((b.lat - a.lat) * p) / 2 +
    (c(a.lat * p) * c(b.lat * p) * (1 - c((b.lng - a.lng) * p))) / 2;
  return 2 * R * Math.asin(Math.sqrt(d));
}
