import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const r = Router();

r.post("/register", validate(auth.registerSchema), auth.register);
r.post("/login", validate(auth.loginSchema), auth.login);
r.get("/me", authenticate, auth.me);

export default r;
