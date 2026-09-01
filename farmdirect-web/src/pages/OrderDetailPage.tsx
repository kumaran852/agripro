import { CheckCircle2, Clock, MapPin, Truck, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/Navbar";
import { useApi, useMutation } from "../hooks/useApi";
import type { Order } from "../types";
import { formatINR, formatKg, statusMeta, titleCase } from "../lib/formatters";
import { apiFetch } from "../lib/api-client";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const STATUS_ORDER = ["PENDING", "ACCEPTED", "IN_TRANSIT", "DELIVERED"];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);

  const { data: order, loading, refresh } = useApi<Order>(
    orderId ? `/v1/orders/${orderId}` : null,
    { auto: !!orderId }
  );

  const runTransition = useMutation(async (status: string) => {
    return apiFetch(`/v1/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  });

  const doTransition = async (status: string) => {
    try {
      await runTransition.exec(status);
      setMsg(`Order moved to ${status}`);
      setTimeout(() => setMsg(null), 2500);
      await refresh();
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    }
  };

  if (loading && !order) {
    return (
      <PageShell>
        <div className="card h-96 animate-pulse" />
      </PageShell>
    );
  }
  if (!order) {
    return (
      <PageShell>
        <div className="card p-10 text-center">
          <h2 className="text-xl font-extrabold">Order not found</h2>
          <button onClick={() => nav(-1)} className="btn-primary mt-4">
            Go back
          </button>
        </div>
      </PageShell>
    );
  }

  const prod = typeof order.productId === "object" ? order.productId : null;
  const buyer =
    typeof order.buyerId === "object"
      ? (order.buyerId as any).userId
      : null;
  const farmer =
    typeof order.farmerId === "object"
      ? (order.farmerId as any).userId
      : null;
  const statusInfo = statusMeta(order.status);

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const isFarmer = user?.role === "farmer" || user?.role === "admin";
  const isBuyer = user?.role === "buyer" || user?.role === "admin";

  return (
    <PageShell>
      <button onClick={() => nav(-1)} className="mb-4 text-xs font-bold text-slate-500 hover:text-brand-700">
        ← Back
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  Order
                </div>
                <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-900">
                  {order.shortId}
                </h1>
                <div className="mt-1 text-xs text-slate-500">
                  Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              <span className={`badge ${statusInfo.className}`}>
                {order.status === "PENDING" && <Clock size={12} />}
                {order.status === "DELIVERED" && <CheckCircle2 size={12} />}
                {order.status === "REJECTED" && <XCircle size={12} />}
                <span>{statusInfo.label}</span>
              </span>
            </div>

            <div className="mt-8">
              <ol className="relative flex items-start justify-between gap-2">
                <span className="absolute left-0 right-0 top-3 mx-6 h-1 rounded bg-slate-200" />
                <span
                  className="absolute left-0 top-3 ml-6 h-1 rounded bg-brand-600 transition-all"
                  style={{
                    width: `calc(${(Math.max(0, currentIdx) / Math.max(1, STATUS_ORDER.length - 1)) * 100}% - 3rem)`,
                  }}
                />
                {STATUS_ORDER.map((s, i) => {
                  const done = i <= currentIdx;
                  const cls = done
                    ? "bg-brand-600 text-white ring-brand-200"
                    : "bg-white text-slate-400 ring-slate-200";
                  return (
                    <li key={s} className="relative z-10 flex flex-col items-center gap-1 text-center">
                      <div
                        className={`grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ring-4 ${cls}`}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <div
                        className={`text-[11px] font-bold ${
                          done ? "text-brand-700" : "text-slate-400"
                        }`}
                      >
                        {titleCase(s)}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
              Line Item
            </h2>
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
              <div className="grid h-20 w-20 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-amber-50 text-5xl">
                {prod?.emoji || "🥬"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-slate-900">{prod?.name || "Produce"}</div>
                <div className="text-xs text-slate-500">
                  {formatKg(order.quantityKg)} × {formatINR(order.pricePerKgAtOrder)}/kg
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase text-slate-400">Total</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {formatINR(order.totalAmount)}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
              Status History
            </h2>
            <ol className="space-y-3">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                  <span className={`badge self-start ${statusMeta(h.status).className}`}>
                    {h.status}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">
                      {new Date(h.at).toLocaleString("en-IN")}
                    </div>
                    {h.note && <div className="text-xs text-slate-600">Note: {h.note}</div>}
                  </div>
                </li>
              ))}
            </ol>
            {msg && (
              <div className="mt-3 rounded-xl bg-brand-50 p-3 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                {msg}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Parties
            </h3>
            <div className="rounded-xl bg-brand-50 p-3 ring-1 ring-brand-100">
              <div className="text-[10px] font-bold uppercase text-brand-700">Seller</div>
              <div className="text-sm font-extrabold text-slate-900">{farmer?.name || "Farmer"}</div>
              {farmer && (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                  <MapPin size={12} /> {farmer.location?.district}
                </div>
              )}
            </div>
            <div className="mt-3 rounded-xl bg-sky-50 p-3 ring-1 ring-sky-100">
              <div className="text-[10px] font-bold uppercase text-sky-700">Buyer</div>
              <div className="text-sm font-extrabold text-slate-900">{buyer?.name || "Buyer"}</div>
              {buyer && (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                  <MapPin size={12} /> {buyer.location?.district}
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Actions
            </h3>
            <div className="space-y-2">
              {isFarmer && order.status === "PENDING" && (
                <>
                  <button
                    onClick={() => doTransition("ACCEPTED")}
                    disabled={runTransition.loading}
                    className="btn-primary w-full"
                  >
                    ✓ Accept Order
                  </button>
                  <button
                    onClick={() => doTransition("REJECTED")}
                    disabled={runTransition.loading}
                    className="btn-danger w-full"
                  >
                    ✗ Reject
                  </button>
                </>
              )}
              {isFarmer && order.status === "ACCEPTED" && (
                <button
                  onClick={() => doTransition("IN_TRANSIT")}
                  disabled={runTransition.loading}
                  className="btn-amber w-full"
                >
                  <Truck size={16} /> Mark In Transit
                </button>
              )}
              {(isFarmer || isBuyer) && order.status === "IN_TRANSIT" && (
                <button
                  onClick={() => doTransition("DELIVERED")}
                  disabled={runTransition.loading}
                  className="btn-primary w-full"
                >
                  <CheckCircle2 size={16} /> Mark Delivered
                </button>
              )}
              {isBuyer && order.status === "PENDING" && (
                <button
                  onClick={() => doTransition("CANCELLED")}
                  disabled={runTransition.loading}
                  className="btn-ghost w-full"
                >
                  Cancel Order
                </button>
              )}
              {order.deliveryId && (
                <button
                  onClick={() => nav("/logistics")}
                  className="btn-ghost w-full"
                >
                  <Truck size={16} /> View Route on Logistics
                </button>
              )}
              {!order.deliveryId && isFarmer && order.status !== "REJECTED" && order.status !== "CANCELLED" && (
                <button onClick={() => nav("/logistics")} className="btn-ghost w-full">
                  Plan delivery route →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
