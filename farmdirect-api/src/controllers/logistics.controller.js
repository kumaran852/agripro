import { z } from "zod";
import Order from "../models/Order.js";
import Farmer from "../models/Farmer.js";
import Delivery from "../models/Delivery.js";
import { callRoute } from "../services/pythonAiClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const routeQuerySchema = z.object({
  query: z.object({
    farmerId: z.string().min(1),
    orderIds: z.string().min(1),
  }),
});

const createDeliverySchema = z.object({
  body: z.object({
    orderIds: z.array(z.string().min(1)).min(1),
    depotFarmerId: z.string().min(1),
  }),
});

const patchDeliverySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(["SCHEDULED", "ENROUTE", "COMPLETED"]),
  }),
});

export const getRoute = [
  (req, _res, next) => {
    const r = routeQuerySchema.safeParse({ query: req.query });
    if (!r.success) {
      return next(new AppError(r.error.message, 400, "VALIDATION"));
    }
    req.validated = r.data;
    next();
  },
  asyncHandler(async (req, res) => {
    const { farmerId, orderIds } = req.validated.query;
    const ids = orderIds.split(",").map((s) => s.trim()).filter(Boolean);
    const farmer = await Farmer.findById(farmerId).populate("userId", "location").lean();
    if (!farmer) throw new AppError("Farmer not found", 404, "NOT_FOUND");
    const orders = await Order.find({ _id: { $in: ids } })
      .populate("buyerId")
      .populate("productId", "name emoji")
      .lean();

    const depot = {
      lat: farmer.userId.location.lat,
      lng: farmer.userId.location.lng,
    };
    const stops = orders
      .filter((o) => o.buyerId)
      .map((o) => {
        const buyerLoc = o.buyerId?.userId?.location || o.buyerId?.location || { lat: 11.1, lng: 77.35 };
        return {
          id: o._id.toString(),
          name: o.buyerId?.userId?.name || "Buyer",
          lat: buyerLoc.lat,
          lng: buyerLoc.lng,
          qtyKg: o.quantityKg,
          orderId: o.shortId,
        };
      });
    const result = await callRoute({ depot, stops });
    res.json({ success: true, data: result });
  }),
];

export const createDelivery = [
  (req, _res, next) => {
    const r = createDeliverySchema.safeParse({ body: req.body });
    if (!r.success) return next(new AppError(r.error.message, 400, "VALIDATION"));
    req.validated = r.data;
    next();
  },
  asyncHandler(async (req, res) => {
    const { orderIds, depotFarmerId } = req.validated.body;
    const farmer = await Farmer.findById(depotFarmerId).populate("userId", "location").lean();
    if (!farmer) throw new AppError("Farmer not found", 404, "NOT_FOUND");
    const orders = await Order.find({ _id: { $in: orderIds } }).populate("buyerId").lean();
    const depot = { lat: farmer.userId.location.lat, lng: farmer.userId.location.lng };
    const stops = orders
      .filter((o) => o.buyerId)
      .map((o) => {
        const buyerLoc = o.buyerId?.userId?.location || { lat: 11.1, lng: 77.35 };
        return {
          id: o._id.toString(),
          name: o.buyerId?.userId?.name || "Buyer",
          lat: buyerLoc.lat,
          lng: buyerLoc.lng,
          qtyKg: o.quantityKg,
          orderId: o.shortId,
        };
      });
    const optimized = await callRoute({ depot, stops });

    const delivery = await Delivery.create({
      orderIds,
      depotFarmerId,
      routeOptimizedStops: optimized.stops,
      distanceKm: optimized.optimizedKm,
      estimatedMinutes: optimized.optimizedMin,
      baselineDistanceKm: optimized.baselineKm,
      baselineMinutes: optimized.baselineMin,
      distanceSavedPct: optimized.distanceSavedPct,
      timeSavedPct: optimized.timeSavedPct,
      status: "SCHEDULED",
    });

    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { deliveryId: delivery._id } }
    );
    res.status(201).json({ success: true, data: delivery });
  }),
];

export const getDelivery = asyncHandler(async (req, res) => {
  const d = await Delivery.findById(req.params.id).populate("orderIds").lean();
  if (!d) throw new AppError("Delivery not found", 404, "NOT_FOUND");
  res.json({ success: true, data: d });
});

export const patchDelivery = [
  (req, _res, next) => {
    const r = patchDeliverySchema.safeParse({ params: req.params, body: req.body });
    if (!r.success) return next(new AppError(r.error.message, 400, "VALIDATION"));
    req.validated = r.data;
    next();
  },
  asyncHandler(async (req, res) => {
    const d = await Delivery.findById(req.validated.params.id);
    if (!d) throw new AppError("Delivery not found", 404, "NOT_FOUND");
    d.status = req.validated.body.status;
    await d.save();
    res.json({ success: true, data: d });
  }),
];
