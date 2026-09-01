import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import forecastRoutes from "./routes/forecast.routes.js";
import logisticsRoutes from "./routes/logistics.routes.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/v1/health", (_req, res) => {
  res.json({
    success: true,
    data: { service: "farmdirect-api", time: new Date().toISOString() },
  });
});

app.use("/v1/auth", authRoutes);
app.use("/v1/products", productRoutes);
app.use("/v1/orders", orderRoutes);
app.use("/v1/forecast", forecastRoutes);
app.use("/v1", logisticsRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route unknown" } });
});

app.use((err, _req, res, _next) => {
  const code = err.code || err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : process.env.NODE_ENV === "production"
      ? "Internal error"
      : err.message || "Something broke";
  if (!err.isOperational && process.env.NODE_ENV !== "production") {
    console.error("[err]", err);
  }
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  res.status(statusCode).json({ success: false, error: { code, message } });
});

export default app;
