import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Buyer from "../models/Buyer.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) token = auth.slice(7);
  if (!token) return next(new AppError("Not authenticated", 401, "NO_TOKEN"));

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return next(new AppError("Invalid or expired token", 401, "BAD_TOKEN"));
  }

  const user = await User.findById(decoded.sub).select("-passwordHash");
  if (!user) return next(new AppError("User no longer exists", 401, "USER_GONE"));

  req.user = user.toObject();
  req.user.id = user._id.toString();

  if (user.role === "farmer") {
    const f = await Farmer.findOne({ userId: user._id });
    if (f) req.farmerId = f._id.toString();
  } else if (user.role === "buyer") {
    const b = await Buyer.findOne({ userId: user._id });
    if (b) req.buyerId = b._id.toString();
  }
  next();
});

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError("Not authenticated", 401, "NO_AUTH"));
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role ${req.user.role} not allowed. Needs: ${roles.join(" / ")}`,
          403,
          "ROLE"
        )
      );
    }
    next();
  };
}
