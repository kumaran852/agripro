import { CalendarDays, MapPin, Package } from "lucide-react";
import { Link } from "react-router-dom";
import {
  cropLabel,
  formatINR,
  formatKg,
  statusMeta,
} from "../../lib/formatters";
import type { Order } from "../../types";

export function OrderCard({ order }: { order: Order }) {
  const p = typeof order.productId === "object" ? order.productId : null;
  const status = statusMeta(order.status);
  const buyer =
    typeof order.buyerId === "object"
      ? (order.buyerId as any).userId
      : null;
  const farmer =
    typeof order.farmerId === "object"
      ? (order.farmerId as any).userId
      : null;
  return (
    <div className="card p-4 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-slate-900">
              {order.shortId}
            </span>
            <span className={`badge ${status.className}`}>{status.label}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            {p ? (
              <>
                <span className="text-lg leading-none">{p.emoji}</span>
                <span className="font-semibold text-slate-800">{p.name}</span>
                <span className="text-slate-300">•</span>
                <span>{cropLabel(p.crop)}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold uppercase text-slate-400">
            Total
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            {formatINR(order.totalAmount)}
          </div>
        </div>
      </div>
      <div className="mt-3 grid gap-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Package size={13} className="text-slate-400" />
          <span>
            <b className="text-slate-800">{formatKg(order.quantityKg)}</b> ×{" "}
            {formatINR(order.pricePerKgAtOrder)}/kg
          </span>
        </div>
        {farmer && (
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-brand-600" />
            <span>
              From: <b className="text-slate-800">{farmer.name}</b>{" "}
              <span className="text-slate-400">
                ({farmer.location?.district})
              </span>
            </span>
          </div>
        )}
        {buyer && (
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-sky-600" />
            <span>
              To: <b className="text-slate-800">{buyer.name}</b>{" "}
              <span className="text-slate-400">
                ({buyer.location?.district})
              </span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CalendarDays size={13} className="text-slate-400" />
          <span>
            Placed: {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </span>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Link to={`/orders/${order._id}`} className="btn-ghost text-xs !py-2 !px-3">
          View details →
        </Link>
      </div>
    </div>
  );
}
