import { z } from "zod";
import Product from "../models/Product.js";
import { getForecast } from "../services/priceEngine.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const listSchema = z.object({
  query: z.object({
    crop: z.string().optional(),
    search: z.string().optional(),
    sort: z
      .enum(["price_asc", "price_desc", "distance", "newest"])
      .default("newest"),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export const createSchema = z.object({
  body: z.object({
    crop: z.enum(["tomato", "potato", "onion", "brinjal", "ladiesfinger"]),
    name: z.string().min(2),
    emoji: z.string().min(1),
    quantityKg: z.number().int().positive(),
    pricePerKg: z.number().positive(),
    harvestDate: z.coerce.date().optional(),
    imageUrl: z.string().optional(),
  }),
});

export const updateSchema = z.object({
  body: z.object({
    quantityKg: z.number().int().min(0).optional(),
    pricePerKg: z.number().positive().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listProducts = asyncHandler(async (req, res) => {
  const { crop, search, sort, minPrice, maxPrice, page, limit } = req.validated.query;
  const filter = { isActive: true };
  if (crop) filter.crop = crop;
  if (search) {
    const re = { $regex: search, $options: "i" };
    filter.$or = [{ name: re }, { crop: re }];
  }
  if (minPrice !== undefined) filter.pricePerKg = { ...(filter.pricePerKg ?? {}), $gte: minPrice };
  if (maxPrice !== undefined)
    filter.pricePerKg = { ...(filter.pricePerKg ?? {}), $lte: maxPrice };

  const sortObj = {
    price_asc: { pricePerKg: 1 },
    price_desc: { pricePerKg: -1 },
    distance: { createdAt: -1 },
    newest: { createdAt: -1 },
  }[sort];

  const total = await Product.countDocuments(filter);
  const items = await Product.find(filter)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "farmerId",
      populate: { path: "userId", select: "name location" },
    })
    .lean();

  res.json({
    success: true,
    data: {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id)
    .populate({
      path: "farmerId",
      populate: { path: "userId", select: "name location phone rating" },
    })
    .lean();
  if (!p) throw new AppError("Product not found", 404, "NOT_FOUND");
  res.json({ success: true, data: p });
});

export const createProduct = asyncHandler(async (req, res) => {
  if (!req.farmerId) throw new AppError("Farmer profile required", 403, "ROLE");
  const b = req.validated.body;
  const forecast = await getForecast(b.crop, b.quantityKg);
  const p = await Product.create({
    farmerId: req.farmerId,
    crop: b.crop,
    name: b.name,
    emoji: b.emoji,
    quantityKg: b.quantityKg,
    originalQuantityKg: b.quantityKg,
    pricePerKg: b.pricePerKg,
    harvestDate: b.harvestDate,
    imageUrl: b.imageUrl,
    aiDemandLevel: forecast.demandLevel,
    aiRecommendedPrice: forecast.recommendedPrice,
  });
  res.status(201).json({ success: true, data: p });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const b = req.validated.body;
  const p = await Product.findById(req.validated.params.id);
  if (!p) throw new AppError("Product not found", 404, "NOT_FOUND");
  if (p.farmerId.toString() !== req.farmerId)
    throw new AppError("Not your product", 403, "OWNER");
  if (b.quantityKg !== undefined) p.quantityKg = b.quantityKg;
  if (b.pricePerKg !== undefined) p.pricePerKg = b.pricePerKg;
  if (b.isActive !== undefined) p.isActive = b.isActive;
  p.updatedAt = new Date();
  await p.save();
  res.json({ success: true, data: p });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw new AppError("Product not found", 404, "NOT_FOUND");
  if (p.farmerId.toString() !== req.farmerId)
    throw new AppError("Not your product", 403, "OWNER");
  p.isActive = false;
  await p.save();
  res.json({ success: true, data: { _id: p._id, isActive: false } });
});
