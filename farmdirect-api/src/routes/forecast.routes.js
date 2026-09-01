import { Router } from "express";
import * as fc from "../controllers/forecast.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const r = Router();

r.get("/", ...fc.getForecastRoute);
r.get("/batch", ...fc.getBatchForecastRoute);
r.post("/refresh", authenticate, requireRole("admin"), fc.refreshForecast);

export default r;
