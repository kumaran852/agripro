import { demandMeta } from "../../lib/formatters";
import type { DemandLevel } from "../../types";

export function AiDemandBadge({
  level,
  showText = true,
}: {
  level: DemandLevel | string;
  showText?: boolean;
}) {
  const m = demandMeta(level);
  return (
    <span className={`badge ${m.className}`}>
      <span>{m.emoji}</span>
      {showText ? <span>AI Demand · {m.label}</span> : <span>{m.label}</span>}
    </span>
  );
}
