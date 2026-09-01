import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ShoppingBasket } from "lucide-react";
import { PageShell } from "../components/layout/Navbar";
import { ProductCard } from "../components/cards/ProductCard";
import { useApi } from "../hooks/useApi";
import type { CropId, Product } from "../types";

const CROP_FILTERS: { id: CropId | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🌾" },
  { id: "tomato", label: "Tomato", emoji: "🍅" },
  { id: "potato", label: "Potato", emoji: "🥔" },
  { id: "onion", label: "Onion", emoji: "🧅" },
  { id: "brinjal", label: "Brinjal", emoji: "🍆" },
  { id: "ladiesfinger", label: "Lady's Finger", emoji: "🫛" },
];

type SortKey = "newest" | "price_asc" | "price_desc";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState<CropId | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const { data, loading } = useApi<{ items: Product[]; pagination: any }>(
    `/v1/products?limit=50&sort=${sort}${cropFilter !== "all" ? `&crop=${cropFilter}` : ""}`,
    { auto: true }
  );

  const items = data?.items || [];
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.crop.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <PageShell>
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-700">
          🛒 Buyer Marketplace
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          Fresh produce, direct from farmers.
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse {loading ? "…" : items.length} listings. AI flags demand-high produce so you don't run out.
        </p>
      </div>

      <div className="card mb-6 flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="input !pl-10"
              placeholder="Search tomato, onion, brinjal…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CROP_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setCropFilter(f.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                cropFilter === f.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-400" />
          <label className="text-xs font-semibold text-slate-500">Sort</label>
          <select
            className="input !py-2 !px-3 !text-xs w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price (Low → High)</option>
            <option value="price_desc">Price (High → Low)</option>
          </select>
        </div>
      </div>

      {loading && filtered.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBasket className="mx-auto mb-3 text-slate-300" size={40} />
          <div className="text-lg font-extrabold text-slate-700">No produce found</div>
          <p className="mt-1 text-sm text-slate-500">
            Try another crop or clear your search filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
