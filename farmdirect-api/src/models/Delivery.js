import mongoose from "mongoose";

const DELIVERY_STATUS = ["SCHEDULED", "ENROUTE", "COMPLETED"];

const routeStopSchema = new mongoose.Schema({
  seq: { type: Number, required: true },
  type: { type: String, enum: ["DEPOT", "BUYER"], required: true },
  name: String,
  lat: Number,
  lng: Number,
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  qtyKg: Number,
});

const deliverySchema = new mongoose.Schema(
  {
    orderIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    ],
    depotFarmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    routeOptimizedStops: [routeStopSchema],
    distanceKm: { type: Number, required: true },
    estimatedMinutes: { type: Number, required: true },
    baselineDistanceKm: { type: Number, required: true },
    baselineMinutes: { type: Number, required: true },
    distanceSavedPct: { type: Number, required: true },
    timeSavedPct: { type: Number, required: true },
    status: {
      type: String,
      enum: DELIVERY_STATUS,
      default: "SCHEDULED",
    },
    scheduledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);
