import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Leaf,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageShell } from "../components/layout/Navbar";
import { StatCard } from "../components/cards/StatCard";
import { AiDemandBadge } from "../components/widgets/AiDemandBadge";
import { PriceComparator } from "../components/widgets/PriceComparator";
import { useApi } from "../hooks/useApi";
import type { CropId, Forecast } from "../types";
import { cropLabel, demandMeta, formatKg } from "../lib/formatters";

const CROPS: { id: CropId; label: string; emoji: string }[] = [
  { id: "tomato", label: "Tomato", emoji: "🍅" },
  { id: "potato", label: "Potato", emoji: "🥔" },
  { id: "onion", label: "Onion", emoji: "🧅" },
  { id: "brinjal", label: "Brinjal", emoji: "🍆" },
  { id: "ladiesfinger", label: "Lady's Finger", emoji: "🫛" },
];

export default function AiDashboardPage() {
  const [crop, setCrop] = useState<CropId>("tomato");
  const { data: forecast, loading } = useApi<Forecast>(`/v1/forecast?crop=${crop}`, {
    auto: true,
  });
  const { data: batch } = useApi<Forecast[]>(
    "/v1/forecast/batch?crops=tomato,potato,onion,brinjal,ladiesfinger"
  );

  return (
    <PageShell>
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
          🧠 AI Insights Dashboard
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          Demand Forecasting & Fair Price Engine
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Scikit-learn regression model · 29-feature vector · refreshed on every load.
        </p>
      </div>

      <div className="card mb-6 flex flex-wrap items-center gap-2 p-3">
        <span className="mr-2 text-xs font-bold uppercase text-slate-400">
          Select crop
        </span>
        {CROPS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCrop(c.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
              crop === c.id
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className="text-lg leading-none">{c.emoji}</span>
            {c.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs">
          <Sparkles size={14} className="text-amber-600" />
          <span className="font-semibold text-slate-600">
            Powered by demand/price ML model
          </span>
        </div>
      </div>

      {loading && !forecast ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : forecast ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label="Predicted Demand (3d)"
              value={formatKg(forecast.predictedDemandKg)}
              tone="green"
              delta={`Demand ratio ${forecast.demandRatio.toFixed(2)}x`}
            />
            <StatCard
              icon={Leaf}
              label="Current Supply (Platform)"
              value={formatKg(forecast.currentSupplyKg)}
              tone="blue"
              delta={`${cropLabel(forecast.crop)} · live`}
            />
            <StatCard
              icon={
                forecast.supplyGapKg > 0 ? AlertTriangle : (BadgeCheck as any)
              }
              label={forecast.supplyGapKg > 0 ? "Expected Shortage ⚠️" : "Surplus Available"}
              value={
                forecast.supplyGapKg > 0
                  ? `+${formatKg(forecast.supplyGapKg)}`
                  : formatKg(Math.abs(forecast.supplyGapKg))
              }
              tone={forecast.supplyGapKg > 0 ? "amber" : "green"}
              delta={
                forecast.supplyGapKg > 0
                  ? "Call for more listings!"
                  : "Market well stocked"
              }
            />
            <StatCard
              icon={Wallet}
              label="AI Recommended Price"
              value={`₹${forecast.recommendedPrice}/kg`}
              tone="amber"
              delta={`vs ₹${forecast.baselineMarketPrice} market baseline`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="card overflow-hidden p-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-amber-50 text-4xl">
                      {CROPS.find((c) => c.id === crop)?.emoji || "🌾"}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">
                        {cropLabel(forecast.crop)} — Market Health
                      </h2>
                      <div className="text-xs text-slate-500">
                        AI aggregated view for the platform
                      </div>
                    </div>
                  </div>
                  <AiDemandBadge level={forecast.demandLevel} />
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
                  <div className="p-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Demand Level
                    </div>
                    <div
                      className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-lg font-extrabold ${
                        demandMeta(forecast.demandLevel).className
                      }`}
                    >
                      <span>{demandMeta(forecast.demandLevel).emoji}</span>
                      {forecast.demandLevel}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Recommended Supply Change
                    </div>
                    {forecast.supplyGapKg > 0 ? (
                      <div className="mt-2 text-lg font-extrabold text-amber-700">
                        +{formatKg(forecast.supplyGapKg)}
                      </div>
                    ) : (
                      <div className="mt-2 text-lg font-extrabold text-brand-700">
                        No shortage
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Sell Verdict
                    </div>
                    <div className="mt-2">
                      {forecast.sellVerdict === "GOOD" && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1.5 text-base font-extrabold text-brand-800 border border-brand-200">
                          🟢 Good time to sell
                        </span>
                      )}
                      {forecast.sellVerdict === "HOLD" && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-base font-extrabold text-slate-700 border border-slate-200">
                          🟡 Consider holding
                        </span>
                      )}
                      {forecast.sellVerdict === "NEUTRAL" && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-base font-extrabold text-sky-800 border border-sky-200">
                          🔵 Hold steady
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                    <BarChart3 size={14} /> 7-Day Sales Trend (Training History Input)
                  </h3>
                  <div className="flex h-44 items-end gap-3">
                    {forecast.trend7day.map((v, i, arr) => {
                      const max = Math.max(...arr);
                      const h = max > 0 ? (v / max) * 100 : 0;
                      return (
                        <div key={i} className="flex flex-1 flex-col items-center gap-2">
                          <div className="text-[11px] font-extrabold text-slate-600">{v}</div>
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-brand-700 via-brand-500 to-amber-400 shadow-sm shadow-brand-200 transition hover:opacity-80"
                            style={{ height: `${h}%` }}
                            title={`Day ${i + 1}: ${v} kg`}
                          />
                          <div className="text-[10px] font-bold text-slate-400">
                            Day {i + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <PriceComparator
                baseline={forecast.baselineMarketPrice}
                recommended={forecast.recommendedPrice}
              />

              <div className="card p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  🧮 How the price is computed
                </h3>
                <ol className="space-y-2.5 text-xs text-slate-600">
                  <li>
                    <b className="text-slate-800">1.</b> Linear regression on 7-day sales, DOW
                    one-hot, season & month features (29 total) predicts next-3d demand{" "}
                    <b>{formatKg(forecast.predictedDemandKg)}</b>.
                  </li>
                  <li>
                    <b className="text-slate-800">2.</b> Demand ratio r = demand / supply ={" "}
                    <b>{forecast.demandRatio.toFixed(3)}</b>.
                  </li>
                  <li>
                    <b className="text-slate-800">3.</b> Elasticity factor f = clamp(0.9 + 0.15 ×
                    (r − 1), 0.85, 1.20) ={" "}
                    <b>
                      {(
                        Math.max(
                          0.85,
                          Math.min(1.2, 0.9 + 0.15 * (forecast.demandRatio - 1))
                        )
                      ).toFixed(3)}
                    </b>
                    .
                  </li>
                  <li>
                    <b className="text-slate-800">4.</b> rec_price = ₹{forecast.baselineMarketPrice} × f ≈{" "}
                    <b className="text-brand-700">₹{forecast.recommendedPrice}/kg</b> ✅
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {batch && (
            <div className="mt-8 card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/60">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">
                  📊 Cross-crop comparison
                </h3>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-white text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3 text-left">Crop</th>
                      <th className="px-5 py-3 text-right">Demand</th>
                      <th className="px-5 py-3 text-right">Supply</th>
                      <th className="px-5 py-3 text-left">Signal</th>
                      <th className="px-5 py-3 text-right">Baseline</th>
                      <th className="px-5 py-3 text-right">AI Rec</th>
                      <th className="px-5 py-3 text-left">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batch.map((f) => (
                      <tr
                        key={f.crop}
                        onClick={() => setCrop(f.crop as CropId)}
                        className={`cursor-pointer transition hover:bg-brand-50/60 ${
                          crop === f.crop ? "bg-brand-50" : ""
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {CROPS.find((c) => c.id === f.crop)?.emoji || "🌾"}
                            </span>
                            <div className="font-extrabold text-slate-900">
                              {cropLabel(f.crop)}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-800">
                          {formatKg(f.predictedDemandKg)}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-800">
                          {formatKg(f.currentSupplyKg)}
                        </td>
                        <td className="px-5 py-3">
                          <AiDemandBadge level={f.demandLevel} />
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-600">
                          ₹{f.baselineMarketPrice}
                        </td>
                        <td className="px-5 py-3 text-right font-extrabold text-brand-700">
                          ₹{f.recommendedPrice}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`badge ${
                              f.sellVerdict === "GOOD"
                                ? "bg-brand-50 text-brand-700 border border-brand-200"
                                : f.sellVerdict === "HOLD"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-sky-50 text-sky-700 border border-sky-200"
                            }`}
                          >
                            {f.sellVerdict === "GOOD"
                              ? "🟢 Good"
                              : f.sellVerdict === "HOLD"
                                ? "🟡 Hold"
                                : "🔵 Steady"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </PageShell>
  );
}
