import { Router } from "express";
import * as p from "../controllers/products.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const r = Router();

r.get("/", validate(p.listSchema), p.listProducts);
r.get("/:id", p.getProduct);

r.use(authenticate, requireRole("farmer", "admin"));
r.post("/", validate(p.createSchema), p.createProduct);
r.patch("/:id", validate(p.updateSchema), p.updateProduct);
r.delete("/:id", p.deleteProduct);

export default r;
