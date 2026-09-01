import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageShell } from "../components/layout/Navbar";
import { useApi, useMutation } from "../hooks/useApi";
import type { Order, Product } from "../types";
import { formatINR, formatKg } from "../lib/formatters";
import { apiFetch } from "../lib/api-client";
import { useAuth } from "../context/AuthContext";

export default function OrderNewPage() {
  const [params] = useSearchParams();
  const productId = params.get("productId");
  const qtyInit = parseInt(params.get("qty") || "100", 10);
  const nav = useNavigate();
  const { user, refreshMe } = useAuth();
  const [qty, setQty] = useState(qtyInit);
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState<Order | null>(null);

  const { data: product, loading } = useApi<Product>(
    productId ? `/v1/products/${productId}` : null,
    { auto: !!productId }
  );

  const total = useMemo(() => (product ? product.pricePerKg * qty : 0), [product, qty]);

  const { exec, loading: placing } = useMutation(async (_: void) => {
    if (!product) throw new Error("Missing product");
    return apiFetch<Order>("/v1/orders", {
      method: "POST",
      body: JSON.stringify({ productId: product._id, quantityKg: qty }),
    });
  });

  const farmerName =
    typeof product?.farmerId === "object"
      ? (product.farmerId as any)?.userId?.name ||
        (product.farmerId as any)?.fpoName ||
        "Farmer"
      : "Farmer";
  const farmerLoc =
    typeof product?.farmerId === "object"
      ? (product.farmerId as any)?.userId?.location
      : null;

  if (loading && !product) {
    return (
      <PageShell>
        <div className="card h-96 animate-pulse" />
      </PageShell>
    );
  }
  if (!product) {
    return (
      <PageShell>
        <div className="card p-10 text-center">
          <h2 className="text-xl font-extrabold">Missing product</h2>
          <Link to="/marketplace" className="btn-primary mt-4 inline-flex">
            Browse marketplace
          </Link>
        </div>
      </PageShell>
    );
  }

  if (confirmed) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl">
          <div className="card overflow-hidden p-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
              Order placed!
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Farmer {farmerName} will review your order shortly.
            </p>
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Order ID</span>
                <b className="text-slate-900">{confirmed.shortId}</b>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-500">Amount</span>
                <b className="text-slate-900">{formatINR(confirmed.totalAmount)}</b>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span className="badge bg-amber-100 text-amber-800 border border-amber-200">
                  Pending Farmer Approval
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => nav("/marketplace")} className="btn-ghost flex-1">
                Continue shopping
              </button>
              <button
                onClick={() => nav(`/orders/${confirmed._id}`)}
                className="btn-primary flex-1"
              >
                Track order
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <Link to={`/products/${product._id}`} className="mb-4 inline-block text-xs font-bold text-slate-500 hover:text-brand-700">
          ← Back to product
        </Link>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">
          Confirm your order
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                Items
              </h2>
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-amber-50 text-5xl">
                  {product.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-slate-900">{product.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {formatINR(product.pricePerKg)} per kg · stock {formatKg(product.quantityKg)}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-500">Qty (kg)</label>
                    <input
                      className="input w-28 !py-1.5 !text-sm"
                      type="number"
                      min={1}
                      max={product.quantityKg}
                      value={qty}
                      onChange={(e) =>
                        setQty(
                          Math.max(1, Math.min(product.quantityKg, parseInt(e.target.value || "0", 10)))
                        )
                      }
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase text-slate-400">Subtotal</div>
                  <div className="text-xl font-extrabold text-slate-900">{formatINR(total)}</div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                Party
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100">
                  <div className="mb-2 text-[11px] font-bold uppercase text-brand-700">
                    🌾 Farmer / Seller
                  </div>
                  <div className="font-extrabold text-slate-900">{farmerName}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                    <MapPin size={12} className="text-brand-600" />
                    <span>
                      {farmerLoc
                        ? `${farmerLoc.district}, ${farmerLoc.state}`
                        : "Tiruppur, TN"}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-sky-50 p-4 ring-1 ring-sky-100">
                  <div className="mb-2 text-[11px] font-bold uppercase text-sky-700">
                    🛒 Buyer
                  </div>
                  <div className="font-extrabold text-slate-900">{user?.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                    <MapPin size={12} className="text-sky-600" />
                    <span>
                      {user?.location
                        ? `${user.location.district}, ${user.location.state}`
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Order note (optional)</label>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="e.g. Please deliver before 10 AM"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="card sticky top-24 p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>{product.name}</span>
                  <span className="font-semibold text-slate-800">
                    {formatKg(qty)} × {formatINR(product.pricePerKg)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <b className="text-slate-800">{formatINR(total)}</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Logistics (bundled)</span>
                  <b className="text-brand-700">Optimized</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Mandi middleman fee</span>
                  <b className="text-brand-700">₹0 saved</b>
                </div>
              </div>
              <div className="my-4 border-t-2 border-dashed border-slate-200" />
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Total
                </span>
                <div className="text-3xl font-extrabold text-slate-900">{formatINR(total)}</div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Payment on delivery · hackathon demo (no real gateway)
              </div>
              <button
                disabled={placing || qty <= 0 || total <= 0}
                onClick={async () => {
                  try {
                    const ord = await exec(undefined as any);
                    setConfirmed(ord);
                    await refreshMe();
                  } catch {}
                }}
                className="btn-primary mt-5 w-full !py-3 !text-base"
              >
                {placing ? "Placing order…" : "✓ Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
