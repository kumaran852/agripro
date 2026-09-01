import { ArrowRight } from "lucide-react";
import { formatINR } from "../../lib/formatters";

export function PriceComparator({
  baseline,
  listed,
  recommended,
}: {
  baseline: number;
  listed?: number;
  recommended: number;
}) {
  const winner =
    recommended > baseline
      ? "Farmer wins · AI recommends higher"
      : recommended < baseline
        ? "Market cooling · consider holding"
        : "Aligned with market";
  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
          💡 Fair Price Recommendation
        </div>
        <div className="text-[11px] font-semibold text-slate-500">{winner}</div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Market Baseline
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-700">
            {formatINR(baseline)}
          </div>
          <div className="text-[10px] font-medium text-slate-400">mandi avg</div>
        </div>
        {typeof listed === "number" && (
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Listed Price
            </div>
            <div className="mt-1 text-lg font-extrabold text-slate-800">
              {formatINR(listed)}
            </div>
            <div className="text-[10px] font-medium text-slate-400">farmer set</div>
          </div>
        )}
        <div className="rounded-xl bg-brand-600 p-3 text-white shadow">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-100">
            AI Recommended
          </div>
          <div className="mt-1 text-lg font-extrabold">{formatINR(recommended)}</div>
          <div className="text-[10px] font-medium text-brand-100">use this</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
        <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200">
          {formatINR(baseline)}
        </span>
        <ArrowRight size={14} className="text-amber-600" />
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700 ring-1 ring-brand-200">
          {formatINR(recommended)}
        </span>
        <span className="ml-1 text-slate-500">
          ({recommended >= baseline ? "+" : ""}
          {(((recommended - baseline) / Math.max(1, baseline)) * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
