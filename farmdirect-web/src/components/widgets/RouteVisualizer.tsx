import { ArrowDown, Building2, Truck } from "lucide-react";
import type { RouteStop } from "../../types";
import { formatKg } from "../../lib/formatters";

export function RouteVisualizer({ stops }: { stops: RouteStop[] }) {
  if (!stops?.length) return null;
  return (
    <ol className="relative ml-3">
      <span className="absolute left-[14px] top-2 h-[calc(100%-24px)] w-0.5 bg-slate-200" />
      {stops.map((s, idx) => {
        const isDepot = s.type === "DEPOT";
        return (
          <li key={s.seq + "_" + idx} className="relative pb-6 last:pb-0">
            <div className="flex items-start gap-3">
              <div
                className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-white shadow ${
                  isDepot
                    ? "bg-brand-600"
                    : "bg-white text-sky-700 ring-2 ring-sky-200"
                }`}
              >
                {isDepot ? <Truck size={15} /> : <Building2 size={15} />}
              </div>
              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-slate-900">
                    <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      Stop #{s.seq}
                    </span>
                    {s.name}
                  </div>
                  <span
                    className={`badge ${
                      isDepot
                        ? "bg-brand-50 text-brand-700 border border-brand-200"
                        : "bg-sky-50 text-sky-700 border border-sky-200"
                    }`}
                  >
                    {isDepot ? "🌾 Farm Depot" : "🛒 Buyer Drop"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {s.orderId ? (
                    <span className="font-semibold text-slate-700">
                      Order {s.orderId} · {formatKg(s.qtyKg)}
                    </span>
                  ) : (
                    <span>Starting location — all goods loaded</span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  📍 {s.lat.toFixed(4)}°N, {s.lng.toFixed(4)}°E
                </div>
              </div>
            </div>
            {idx < stops.length - 1 && (
              <div className="absolute left-[14px] top-8 z-0 -translate-x-1/2">
                <ArrowDown size={14} className="text-slate-300" />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function RouteMapSvg({ stops }: { stops: RouteStop[] }) {
  if (!stops?.length) return null;
  const minLat = Math.min(...stops.map((s) => s.lat));
  const maxLat = Math.max(...stops.map((s) => s.lat));
  const minLng = Math.min(...stops.map((s) => s.lng));
  const maxLng = Math.max(...stops.map((s) => s.lng));
  const pad = 20;
  const W = 600;
  const H = 300;
  const latRange = Math.max(0.001, maxLat - minLat);
  const lngRange = Math.max(0.001, maxLng - minLng);
  const pct = (
    v: number,
    lo: number,
    hi: number,
    range: number,
    outLo: number,
    outHi: number
  ) => outLo + ((v - lo) / range) * (outHi - outLo);
  const pts = stops.map((s) => ({
    x: pct(s.lng, minLng, maxLng, lngRange, pad, W - pad),
    y: H - pct(s.lat, minLat, maxLat, latRange, pad, H - pad),
    s,
  }));
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-sky-50"
    >
      <defs>
        <marker
          id="arr"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
        </marker>
      </defs>
      {pts.slice(0, -1).map((p, i) => {
        const n = pts[i + 1];
        return (
          <line
            key={i}
            x1={p.x}
            y1={p.y}
            x2={n.x}
            y2={n.y}
            stroke="#16a34a"
            strokeWidth="3"
            strokeDasharray="0"
            markerEnd="url(#arr)"
            opacity="0.8"
          />
        );
      })}
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          <circle
            r="16"
            fill={p.s.type === "DEPOT" ? "#16a34a" : "#0284c7"}
            stroke="#fff"
            strokeWidth="3"
          />
          <text
            y="4"
            textAnchor="middle"
            className="fill-white"
            fontSize="12"
            fontWeight="800"
          >
            {p.s.seq}
          </text>
          <text
            y="36"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#334155"
          >
            {p.s.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
