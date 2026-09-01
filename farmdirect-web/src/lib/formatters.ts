export function formatINR(n: number): string {
  if (!isFinite(n)) return "₹0";
  const rounded = Math.round(n);
  const [whole, dec] = rounded.toFixed(2).split(".");
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const withCommas =
    (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," : "") + last3;
  return `₹${withCommas}`;
}

export function formatKg(n: number): string {
  return `${n.toLocaleString("en-IN")} kg`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function cropLabel(crop: string): string {
  const map: Record<string, string> = {
    tomato: "Tomato",
    potato: "Potato",
    onion: "Onion",
    brinjal: "Brinjal",
    ladiesfinger: "Lady's Finger",
  };
  return map[crop] || crop;
}

export const demandMeta = (
  lvl: string
): { label: string; className: string; emoji: string } => {
  if (lvl === "HIGH")
    return {
      label: "HIGH",
      className: "bg-orange-100 text-orange-700 border border-orange-200",
      emoji: "🔥",
    };
  if (lvl === "LOW")
    return {
      label: "LOW",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      emoji: "🟢",
    };
  return {
    label: "MEDIUM",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    emoji: "🟡",
  };
};

export const statusMeta = (
  status: string
): { label: string; className: string } => {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        className: "bg-amber-100 text-amber-800 border border-amber-200",
      };
    case "ACCEPTED":
      return {
        label: "Accepted",
        className: "bg-brand-100 text-brand-800 border border-brand-200",
      };
    case "IN_TRANSIT":
      return {
        label: "In Transit",
        className: "bg-sky-100 text-sky-800 border border-sky-200",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        className: "bg-rose-100 text-rose-700 border border-rose-200",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-slate-200 text-slate-700 border border-slate-300",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700 border border-slate-200",
      };
  }
};
