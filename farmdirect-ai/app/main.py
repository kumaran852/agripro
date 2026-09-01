from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.config import BASELINE_PRICES_PER_KG
from app.demand import predict_demand
from app.pricing import recommend_price
from app.route import RouteRequest, optimize_route

app = FastAPI(title="Farm Direct AI Internal Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/internal/ai/health")
def health():
    return {"status": "ok", "service": "farmdirect-ai"}


@app.get("/internal/ai/demand")
def demand_forecast(crop: str = Query(..., description="Crop id e.g. tomato")):
    crop_id = crop.lower()
    if crop_id not in BASELINE_PRICES_PER_KG:
        raise HTTPException(status_code=400, detail=f"Unknown crop: {crop}")
    predicted_kg, trend = predict_demand(crop_id)
    return {
        "crop": crop_id,
        "predictedDemandKg": predicted_kg,
        "trend7day": trend,
    }


@app.get("/internal/ai/price")
def price_recommendation(
    crop: str = Query(..., description="Crop id e.g. tomato"),
    supply_kg: float = Query(500.0, description="Current platform supply in kg"),
):
    crop_id = crop.lower()
    if crop_id not in BASELINE_PRICES_PER_KG:
        raise HTTPException(status_code=400, detail=f"Unknown crop: {crop}")
    return recommend_price(crop_id, supply_kg)


@app.post("/internal/ai/route")
def route_optimization(req: RouteRequest):
    return optimize_route(req)
