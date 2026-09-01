import { Router } from "express";
import * as lg from "../controllers/logistics.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const r = Router();
r.use(authenticate);

r.get("/route", ...lg.getRoute);
r.post("/deliveries", requireRole("farmer", "admin"), ...lg.createDelivery);
r.get("/deliveries/:id", lg.getDelivery);
r.patch("/deliveries/:id/status", requireRole("farmer", "admin"), ...lg.patchDelivery);

export default r;
