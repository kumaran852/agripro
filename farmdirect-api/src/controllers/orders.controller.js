import { z } from "zod";
import mongoose from "mongoose"; // Added mongoose to handle clean ObjectId generation
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Buyer from "../models/Buyer.js";
import Farmer from "../models/Farmer.js";
import Delivery from "../models/Delivery.js";
import { callRoute } from "../services/pythonAiClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const TRANSITIONS = {
  buyer: { PENDING: ["CANCELLED"] },
  farmer: {
    PENDING: ["ACCEPTED", "REJECTED"],
    ACCEPTED: ["IN_TRANSIT"],
    IN_TRANSIT: ["DELIVERED"],
  },
  admin: {
    PENDING: ["ACCEPTED", "REJECTED", "CANCELLED"],
    ACCEPTED: ["IN_TRANSIT", "CANCELLED"],
    IN_TRANSIT: ["DELIVERED"],
  },
};

export const createSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantityKg: z.number().int().positive(),
  }),
});

export const listSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    role: z.enum(["buyer", "farmer"]).optional(),
  }),
});

export const statusSchema = z.object({
  body: z.object({
    status: z.enum([
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
    ]),
    note: z.string().optional(),
    force: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

function canTransition(userRole, currentStatus, nextStatus, force = false) {
  if (force && userRole === "admin") return true;
  const rules = TRANSITIONS[userRole] || {};
  const allowed = rules[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export const createOrder = asyncHandler(async (req, res) => {
  if (!req.buyerId) throw new AppError("Buyer profile required", 403, "ROLE");
  const { productId, quantityKg } = req.validated.body;
  const product = await Product.findById(productId).populate("farmerId");
  if (!product || !product.isActive) throw new AppError("Product not available", 404, "NOT_FOUND");
  if (quantityKg > product.quantityKg)
    throw new AppError(
      `Insufficient stock. Available: ${product.quantityKg} kg`,
      400,
      "STOCK"
    );

  const totalAmount = Math.round(quantityKg * product.pricePerKg);
  
  // Safe extraction of the user ID creating this document
  const actorId = req.user?.id || req.userId;

  const order = await Order.create({
    buyerId: req.buyerId,
    farmerId: product.farmerId._id,
    productId: product._id,
    quantityKg,
    pricePerKgAtOrder: product.pricePerKg,
    totalAmount,
    status: "PENDING",
    statusHistory: [
      { 
        status: "PENDING", 
        at: new Date(), 
        by: actorId ? new mongoose.Types.ObjectId(actorId) : undefined
      }
    ],
  });

  res.status(201).json({ success: true, data: order });
});

export const listOrders = asyncHandler(async (req, res) => {
  const { status, role } = req.validated.query;
  const filter = {};
  const effectiveRole = role || req.user.role;
  if (effectiveRole === "buyer" && req.buyerId) filter.buyerId = req.buyerId;
  if (effectiveRole === "farmer" && req.farmerId) filter.farmerId = req.farmerId;
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("productId", "name emoji crop pricePerKg quantityKg")
    .populate({ path: "farmerId", populate: { path: "userId", select: "name location" } })
    .populate({ path: "buyerId", populate: { path: "userId", select: "name location businessType" } })
    .lean();
  res.json({ success: true, data: orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const o = await Order.findById(req.params.id)
    .populate("productId", "name emoji crop")
    .populate({ path: "farmerId", populate: { path: "userId", select: "name location phone" } })
    .populate({ path: "buyerId", populate: { path: "userId", select: "name location phone" } })
    .populate("deliveryId")
    .lean();
  if (!o) throw new AppError("Order not found", 404, "NOT_FOUND");
  const isBuyer = req.buyerId && o.buyerId._id.toString() === req.buyerId;
  const isFarmer = req.farmerId && o.farmerId._id.toString() === req.farmerId;
  const isAdmin = req.user.role === "admin";
  if (!isBuyer && !isFarmer && !isAdmin)
    throw new AppError("Not your order", 403, "OWNER");
  res.json({ success: true, data: o });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, force } = req.validated.body;
  const o = await Order.findById(req.validated.params.id);
  if (!o) throw new AppError("Order not found", 404, "NOT_FOUND");
  const actorRole = force && req.user.role === "admin" ? "admin" : req.user.role;

  if (!canTransition(actorRole, o.status, status, !!force)) {
    throw new AppError(
      `Cannot transition ${o.status} → ${status} as ${actorRole}`,
      400,
      "TRANSITION"
    );
  }

  o.status = status;
  o.statusHistory.push({ status, at: new Date(), by: req.user.id, note });

  if (status === "ACCEPTED") {
    const product = await Product.findById(o.productId);
    if (product) {
      product.quantityKg = Math.max(0, product.quantityKg - o.quantityKg);
      if (product.quantityKg === 0) product.isActive = false;
      await product.save();
    }
    const buyer = await Buyer.findById(o.buyerId);
    if (buyer) {
      buyer.totalSpend += o.totalAmount;
      await buyer.save();
    }
  }
  if (status === "DELIVERED") {
    const farmer = await Farmer.findById(o.farmerId);
    if (farmer) {
      farmer.totalRevenue += o.totalAmount;
      await farmer.save();
    }
  }

  await o.save();
  await o.populate("productId deliveryId");
  res.json({ success: true, data: o });
});
