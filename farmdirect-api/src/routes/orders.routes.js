import { Router } from "express";
import * as o from "../controllers/orders.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const r = Router();
r.use(authenticate);

r.post("/", validate(o.createSchema), o.createOrder);
r.get("/", validate(o.listSchema), o.listOrders);
r.get("/:id", o.getOrder);
r.patch("/:id/status", validate(o.statusSchema), o.updateOrderStatus);

export default r;
