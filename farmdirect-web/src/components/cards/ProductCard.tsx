import { MapPin, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatINR, formatKg } from "../../lib/formatters";
import type { Product } from "../../types";
import { AiDemandBadge } from "../widgets/AiDemandBadge";

export function ProductCard({ product }: { product: Product }) {
  const farmer =
    typeof product.farmerId === "object"
      ? {
          name:
            (product.farmerId as any).userId?.name ||
            (product.farmerId as any).fpoName ||
            "Farmer",
          location: (product.farmerId as any).userId?.location,
          rating: (product.farmerId as any).rating || 4.5,
        }
      : { name: "Farmer", location: null, rating: 4.5 };

  const stockLow = product.quantityKg > 0 && product.quantityKg < 50;
  const soldOut = product.quantityKg === 0;

  return (
    <div className="card group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="grid aspect-[5/2] place-items-center bg-gradient-to-br from-brand-50 via-white to-amber-50 text-6xl">
        <span className="drop-shadow-sm transition group-hover:scale-110">{product.emoji}</span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold text-slate-900">
              {product.name}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={12} className="text-slate-400" />
              <span className="truncate">
                {farmer.location
                  ? `${farmer.location.district}, ${farmer.location.state}`
                  : "Tiruppur, TN"}
              </span>
              <span className="mx-1 text-slate-300">•</span>
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span className="font-semibold text-slate-700">{farmer.rating.toFixed(1)}</span>
            </div>
          </div>
          <AiDemandBadge level={product.aiDemandLevel} showText={false} />
        </div>
        <div className="flex items-end justify-between gap-3 pt-1">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Price
            </div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900">
              {formatINR(product.pricePerKg)}
              <span className="ml-1 text-[12px] font-semibold text-slate-500">/kg</span>
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Avail: <span className="font-semibold text-slate-700">{formatKg(product.quantityKg)}</span>
            </div>
          </div>
          <Link
            to={`/products/${product._id}`}
            className={`btn-primary !py-2 !px-3.5 text-xs ${
              soldOut ? "pointer-events-none !bg-slate-300" : ""
            }`}
          >
            <ShoppingCart size={15} />
            {soldOut ? "Sold Out" : stockLow ? "Buy" : "Buy"}
          </Link>
        </div>
        {stockLow && !soldOut && (
          <div className="absolute left-3 top-3 badge bg-amber-100 text-amber-800 border border-amber-200">
            ⚠️ Low stock
          </div>
        )}
      </div>
    </div>
  );
}
