import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Buyer from "../models/Buyer.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const registerSchema = z.object({
  body: z.object({
    role: z.enum(["farmer", "buyer", "admin"]),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(4),
    phone: z.string().optional(),
    location: z.object({
      district: z.string().min(2),
      state: z.string().min(2),
      lat: z.number(),
      lng: z.number(),
    }),
    fpoName: z.string().optional(),
    farmSizeAcres: z.number().optional(),
    primaryCrops: z.array(z.string()).optional(),
    businessType: z
      .enum(["restaurant", "retail", "wholesale", "institution"])
      .optional(),
    gstin: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

function signToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

async function attachProfile(userObj) {
  const out = { ...userObj };
  delete out.passwordHash;
  if (out.role === "farmer") {
    const f = await Farmer.findOne({ userId: out._id }).lean();
    out.profile = f;
  } else if (out.role === "buyer") {
    const b = await Buyer.findOne({ userId: out._id }).lean();
    out.profile = b;
  }
  return out;
}

export const register = asyncHandler(async (req, res) => {
  const b = req.validated.body;
  const existing = await User.findOne({ email: b.email });
  if (existing) throw new AppError("Email already registered", 409, "DUPLICATE_EMAIL");

  const passwordHash = await User.hashPassword(b.password);
  const user = await User.create({
    role: b.role,
    name: b.name,
    email: b.email,
    passwordHash,
    phone: b.phone,
    location: b.location,
  });

  if (b.role === "farmer") {
    await Farmer.create({
      userId: user._id,
      fpoName: b.fpoName,
      farmSizeAcres: b.farmSizeAcres,
      primaryCrops: b.primaryCrops ?? [],
      totalRevenue: 0,
    });
  } else if (b.role === "buyer") {
    await Buyer.create({
      userId: user._id,
      businessType: b.businessType ?? "retail",
      gstin: b.gstin,
      totalSpend: 0,
    });
  }

  const token = signToken(user._id.toString());
  const profile = await attachProfile(user.toObject());
  res.status(201).json({ success: true, data: { token, user: profile } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid credentials", 401, "AUTH");
  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError("Invalid credentials", 401, "AUTH");

  const token = signToken(user._id.toString());
  const profile = await attachProfile(user.toObject());
  res.status(200).json({ success: true, data: { token, user: profile } });
});

export const me = asyncHandler(async (req, res) => {
  const profile = await attachProfile(req.user);
  res.json({ success: true, data: { user: profile } });
});
