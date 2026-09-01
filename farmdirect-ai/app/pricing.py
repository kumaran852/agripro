from typing import Dict, Any, Literal
from app.config import BASELINE_PRICES_PER_KG
from app.demand import predict_demand

DemandLevel = Literal["HIGH", "MEDIUM", "LOW"]
SellVerdict = Literal["GOOD", "NEUTRAL", "HOLD"]


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def recommend_price(crop: str, supply_kg: float) -> Dict[str, Any]:
    base_price = BASELINE_PRICES_PER_KG.get(crop, 25)
    predicted_demand_kg, trend = predict_demand(crop)
    safe_supply = max(1.0, float(supply_kg))

    demand_ratio = predicted_demand_kg / safe_supply

    if demand_ratio > 1.3:
        demand_level: DemandLevel = "HIGH"
    elif demand_ratio < 0.85:
        demand_level = "LOW"
    else:
        demand_level = "MEDIUM"

    elasticity_factor = _clamp(0.9 + 0.15 * (demand_ratio - 1.0), 0.85, 1.20)
    recommended_price = max(1, round(base_price * elasticity_factor))

    if demand_level == "HIGH" and recommended_price > base_price:
        verdict: SellVerdict = "GOOD"
    elif demand_level == "LOW":
        verdict = "HOLD"
    else:
        verdict = "NEUTRAL"

    supply_gap_kg = max(0, round(predicted_demand_kg - safe_supply))

    return {
        "crop": crop,
        "baselineMarketPrice": base_price,
        "recommendedPrice": recommended_price,
        "predictedDemandKg": round(predicted_demand_kg),
        "currentSupplyKg": round(safe_supply),
        "demandRatio": round(demand_ratio, 3),
        "demandLevel": demand_level,
        "supplyGapKg": supply_gap_kg,
        "sellVerdict": verdict,
        "trend7day": trend,
    }
