import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  tone?: "green" | "amber" | "blue" | "slate";
}

const TONES = {
  green: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-sky-50 text-sky-700",
  slate: "bg-slate-100 text-slate-700",
} as const;

export function StatCard({ icon: Icon, label, value, delta, tone = "green" }: Props) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${TONES[tone]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
          {value}
        </div>
        {delta ? (
          <div className="mt-0.5 text-xs font-semibold text-brand-700">{delta}</div>
        ) : null}
      </div>
    </div>
  );
}
