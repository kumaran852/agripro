import { useState } from "react";
import { X } from "lucide-react";
import type { CropId } from "../../types";
import { cropLabel } from "../../lib/formatters";
import { useMutation } from "../../hooks/useApi";
import { apiFetch } from "../../lib/api-client";

const CROPS: { id: CropId; emoji: string; name: string }[] = [
  { id: "tomato", emoji: "🍅", name: "Tomato" },
  { id: "potato", emoji: "🥔", name: "Potato" },
  { id: "onion", emoji: "🧅", name: "Onion" },
  { id: "brinjal", emoji: "🍆", name: "Brinjal" },
  { id: "ladiesfinger", emoji: "🫛", name: "Lady's Finger" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductModal({ open, onClose, onSuccess }: Props) {
  const [crop, setCrop] = useState<CropId>("tomato");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍅");
  const [qty, setQty] = useState(500);
  const [price, setPrice] = useState(25);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const { exec, loading } = useMutation(async (_: void) => {
    if (!name.trim()) throw new Error("Enter product name");
    if (qty <= 0) throw new Error("Quantity must be > 0");
    if (price <= 0) throw new Error("Price must be > 0");
    return apiFetch("/v1/products", {
      method: "POST",
      body: JSON.stringify({
        crop,
        name: name.trim(),
        emoji: emoji || CROPS.find((c) => c.id === crop)!.emoji,
        quantityKg: qty,
        pricePerKg: price,
      }),
    });
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-700">
              🌾 List New Produce
            </div>
            <div className="mt-0.5 text-xl font-extrabold text-slate-900">
              Add to Marketplace
            </div>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-slate-100" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Crop</label>
            <div className="grid grid-cols-5 gap-2">
              {CROPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCrop(c.id);
                    setEmoji(c.emoji);
                    if (!name.trim()) setName(c.name);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition ${
                    crop === c.id
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="font-semibold text-slate-700">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Product name</label>
            <input
              className="input"
              placeholder={`e.g. Hybrid ${cropLabel(crop)}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity (kg)</label>
              <input
                className="input"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
              />
            </div>
            <div>
              <label className="label">Price ₹ / kg</label>
              <input
                className="input"
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value || "0", 10))}
              />
            </div>
          </div>
          {errMsg && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
              {errMsg}
            </div>
          )}
        </div>
        <div className="mt-6 flex gap-2">
          <button className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            disabled={loading}
            onClick={async () => {
              setErrMsg(null);
              try {
                await exec(undefined as any);
                onSuccess();
                onClose();
                setName("");
                setQty(500);
                setPrice(25);
              } catch (e: any) {
                setErrMsg(e?.message || "Failed");
              }
            }}
          >
            {loading ? "Listing…" : "List Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
