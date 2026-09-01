import { z } from "zod";
import Product from "../models/Product.js";
import Farmer from "../models/Farmer.js";
import { getBatchForecast, getForecast } from "../services/priceEngine.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const forecastSchema = z.object({
  query: z.object({
    crop: z.enum(["tomato", "potato", "onion", "brinjal", "ladiesfinger"]),
  }),
});

const batchSchema = z.object({
  query: z.object({
    crops: z.string().default("tomato,potato,onion"),
  }),
});

export const getForecastRoute = [
  (req, _res, next) => {
    const result = forecastSchema.safeParse({ query: req.query });
    if (!result.success) {
      req.queryError = result.error;
    } else {
      req.validated = result.data;
    }
    next();
  },
  asyncHandler(async (req, res) => {
    if (req.queryError) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION", message: req.queryError.message },
      });
    }
    const crop = req.validated.query.crop;
    const supply = await Product.aggregate([
      { $match: { crop, isActive: true } },
      { $group: { _id: null, total: { $sum: "$originalQuantityKg" } } },
    ]);
    const supplyKg = supply[0]?.total ?? 480;
    const result = await getForecast(crop, supplyKg);
    res.json({ success: true, data: result });
  }),
];

export const getBatchForecastRoute = [
  (req, _res, next) => {
    const result = batchSchema.safeParse({ query: req.query });
    req.validated = result.success ? result.data : { query: { crops: "tomato,potato,onion" } };
    next();
  },
  asyncHandler(async (req, res) => {
    const crops = req.validated.query.crops.split(",").map((s) => s.trim()).filter(Boolean);
    const results = await getBatchForecast(crops);
    res.json({ success: true, data: results });
  }),
];

export const refreshForecast = asyncHandler(async (_req, res) => {
  const products = await Product.find({ isActive: true }).lean();
  const byCrop = {};
  products.forEach((p) => {
    byCrop[p.crop] = (byCrop[p.crop] || 0) + p.originalQuantityKg;
  });
  const cropList = Object.keys(byCrop);
  const forecasts = await getBatchForecast(cropList);
  const byCropForecast = Object.fromEntries(forecasts.map((f) => [f.crop, f]));
  const updates = [];
  for (const p of products) {
    const f = byCropForecast[p.crop];
    if (f) {
      updates.push(
        Product.updateOne(
          { _id: p._id },
          {
            $set: {
              aiDemandLevel: f.demandLevel,
              aiRecommendedPrice: f.recommendedPrice,
            },
          }
        )
      );
    }
  }
  await Promise.all(updates);
  res.json({ success: true, data: { updated: updates.length, crops: cropList } });
});
