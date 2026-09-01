import math
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from app.config import AVERAGE_ROAD_SPEED_KMH


class GeoPoint(BaseModel):
    lat: float
    lng: float


class RouteStop(BaseModel):
    id: str = ""
    name: str
    lat: float
    lng: float
    qtyKg: float = 0.0
    orderId: str | None = None


class RouteRequest(BaseModel):
    depot: GeoPoint
    stops: List[RouteStop]


def _haversine_km(a: GeoPoint, b: GeoPoint) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(a.lat), math.radians(b.lat)
    dphi = math.radians(b.lat - a.lat)
    dlmb = math.radians(b.lng - a.lng)
    h = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlmb / 2.0) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def _route_distance_km(depot: GeoPoint, order: List[RouteStop]) -> float:
    total = 0.0
    prev: GeoPoint = depot
    for stop in order:
        total += _haversine_km(prev, GeoPoint(lat=stop.lat, lng=stop.lng))
        prev = GeoPoint(lat=stop.lat, lng=stop.lng)
    return total


def _nearest_neighbor(depot: GeoPoint, stops: List[RouteStop]) -> List[RouteStop]:
    remaining = list(stops)
    ordered: List[RouteStop] = []
    cur: GeoPoint = depot
    while remaining:
        nxt = min(remaining, key=lambda s: _haversine_km(cur, GeoPoint(lat=s.lat, lng=s.lng)))
        ordered.append(nxt)
        cur = GeoPoint(lat=nxt.lat, lng=nxt.lng)
        remaining.remove(nxt)
    return ordered


def _two_opt(depot: GeoPoint, stops: List[RouteStop], iterations: int = 50) -> List[RouteStop]:
    best = list(stops)
    best_d = _route_distance_km(depot, best)
    n = len(best)
    for _ in range(iterations):
        improved = False
        for i in range(n - 1):
            for j in range(i + 1, n):
                candidate = best[:i] + best[i : j + 1][::-1] + best[j + 1 :]
                d = _route_distance_km(depot, candidate)
                if d < best_d - 1e-6:
                    best, best_d = candidate, d
                    improved = True
        if not improved:
            break
    return best


def optimize_route(req: RouteRequest) -> Dict[str, Any]:
    depot = req.depot
    stops = req.stops

    baseline_order = list(stops)
    baseline_km = _route_distance_km(depot, baseline_order)
    baseline_min = (baseline_km / AVERAGE_ROAD_SPEED_KMH) * 60.0

    if len(stops) <= 1:
        optimized_order = baseline_order
    else:
        nn = _nearest_neighbor(depot, stops)
        optimized_order = _two_opt(depot, nn)

    optimized_km = _route_distance_km(depot, optimized_order)
    optimized_min = (optimized_km / AVERAGE_ROAD_SPEED_KMH) * 60.0

    distance_saved_pct = 0.0 if baseline_km < 1e-6 else 100.0 * (baseline_km - optimized_km) / baseline_km
    time_saved_pct = 0.0 if baseline_min < 1e-6 else 100.0 * (baseline_min - optimized_min) / baseline_min

    full_stops: List[Dict[str, Any]] = [
        {
            "seq": 0,
            "type": "DEPOT",
            "name": "Farm Depot",
            "lat": depot.lat,
            "lng": depot.lng,
            "orderId": None,
            "qtyKg": 0.0,
        }
    ]
    for idx, s in enumerate(optimized_order, start=1):
        full_stops.append(
            {
                "seq": idx,
                "type": "BUYER",
                "name": s.name,
                "lat": s.lat,
                "lng": s.lng,
                "orderId": s.orderId,
                "qtyKg": s.qtyKg,
            }
        )

    return {
        "baselineKm": round(baseline_km, 1),
        "optimizedKm": round(optimized_km, 1),
        "baselineMin": round(baseline_min),
        "optimizedMin": round(optimized_min),
        "distanceSavedPct": round(distance_saved_pct, 1),
        "timeSavedPct": round(time_saved_pct, 1),
        "stops": full_stops,
    }
