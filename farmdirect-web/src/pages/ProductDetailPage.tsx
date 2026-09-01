import { MapPin, Minus, Plus, ShoppingCart, Star, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/Navbar";
import { AiDemandBadge } from "../components/widgets/AiDemandBadge";
import { PriceComparator } from "../components/widgets/PriceComparator";
import { useApi } from "../hooks/useApi";
import type { Product, Forecast } from "../types";
import { cropLabel, formatINR, formatKg } from "../lib/formatters";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [qty, setQty] = useState(100);

  const { data: product, loading } = useApi<Product>(
    productId ? `/v1/products/${productId}` : null,
    { auto: !!productId }
  );
  const { data: forecast } = useApi<Forecast>(
    product ? `/v1/forecast?crop=${product.crop}` : null,
    { auto: !!product }
  );

  const total = useMemo(() => (product ? product.pricePerKg * qty : 0), [product, qty]);

  const farmerName =
    typeof product?.farmerId === "object"
      ? (product?.farmerId as any)?.userId?.name ||
        (product?.farmerId as any)?.fpoName ||
        "Farmer"
      : "Farmer";
  const farmerLocation =
    typeof product?.farmerId === "object"
      ? (product?.farmerId as any)?.userId?.location
      : null;
  const farmerRating =
    typeof product?.farmerId === "object"
      ? ((product?.farmerId as any)?.rating as number) || 4.5
      : 4.5;

  const maxQty = product?.quantityKg || 0;
  const stockLow = maxQty > 0 && maxQty < 50;
  const soldOut = maxQty === 0;

  if (loading && !product) {
    return (
      <PageShell>
        <div className="card animate-pulse p-10 h-[60vh]" />
      </PageShell>
    );
  }
  if (!product) {
    return (
      <PageShell>
        <div className="card p-10 text-center">
          <h2 className="text-xl font-extrabold">Product not found</h2>
          <button onClick={() => nav("/marketplace")} className="btn-primary mt-4">
            Back to marketplace
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <button
        onClick={() => nav(-1)}
        className="mb-4 text-xs font-bold text-slate-500 hover:text-brand-700"
      >
        ← Back to marketplace
      </button>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="card overflow-hidden">
            <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-brand-50 via-white to-amber-50 text-[9rem]">
              {product.emoji}
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <AiDemandBadge level={forecast?.demandLevel || product.aiDemandLevel} />
                <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
                  {cropLabel(product.crop)}
                </span>
                {stockLow && (
                  <span className="badge bg-amber-100 text-amber-800 border border-amber-200">
                    ⚠️ Low stock
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {product.name}
              </h1>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Farmer / FPO
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <span>{farmerName}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} className="text-slate-400" />
                    <span>
                      {farmerLocation
                        ? `${farmerLocation.district}, ${farmerLocation.state}`
                        : "Tiruppur, TN"}
                    </span>
                    <span className="mx-1 text-slate-300">•</span>
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-slate-700">
                      {farmerRating.toFixed(1)} ★
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Available
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-slate-900">
                    {formatKg(product.quantityKg)}
                  </div>
                  <div className="text-xs text-slate-500">
                    of {formatKg(product.originalQuantityKg)} listed
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    🚚 Delivery
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-800">
                    Optimized Route
                  </div>
                  <div className="text-xs text-slate-500">
                    Route engine plans multi-drop
                  </div>
                </div>
              </div>
            </div>
          </div>

          {forecast && (
            <PriceComparator
              baseline={forecast.baselineMarketPrice}
              listed={product.pricePerKg}
              recommended={forecast.recommendedPrice}
            />
          )}

          {forecast && (
            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                7-day demand trend (kg sold)
              </h3>
              <div className="mt-4 flex h-40 items-end gap-2">
                {forecast.trend7day.map((v, i, arr) => {
                  const max = Math.max(...arr);
                  const h = max > 0 ? (v / max) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="text-[10px] font-bold text-slate-500">{v}</div>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400"
                        style={{ height: `${h}%` }}
                      />
                      <div className="text-[10px] font-semibold text-slate-500">
                        D{i + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="card sticky top-24 overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Price
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {formatINR(product.pricePerKg)}
                    <span className="ml-1 text-sm font-semibold text-slate-400">
                      /kg
                    </span>
                  </div>
                </div>
                {forecast ? (
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-brand-600">
                      AI Recommended
                    </div>
                    <div className="text-xl font-extrabold text-brand-700">
                      {formatINR(forecast.recommendedPrice)}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="!mb-0 label">Quantity (kg)</label>
                  <span className="text-xs font-semibold text-slate-500">
                    Max {formatKg(maxQty)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 10))}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    disabled={qty <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    className="input text-center !text-lg font-extrabold"
                    type="number"
                    min={1}
                    max={maxQty}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value || "0", 10))))
                    }
                  />
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 10))}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    disabled={qty >= maxQty}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Truck size={13} /> Expected to ship in optimized batch with 3–5 stops
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>
                    {formatKg(qty)} × {formatINR(product.pricePerKg)}/kg
                  </span>
                  <span className="font-semibold text-slate-800">{formatINR(total)}</span>
                </div>
                <div className="my-3 border-t border-dashed border-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Total
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              {user?.role === "farmer" && (
                <div className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                  ℹ️ You're viewing as farmer. Switch to a buyer account to place orders.
                </div>
              )}

              <button
                onClick={() =>
                  nav(`/orders/new?productId=${product._id}&qty=${qty}`)
                }
                disabled={soldOut || user?.role === "farmer"}
                className="btn-primary w-full !py-3.5 !text-base"
              >
                <ShoppingCart size={18} />
                {soldOut ? "Sold Out" : "Place Order →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
