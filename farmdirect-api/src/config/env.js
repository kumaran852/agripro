import "dotenv/config";

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/farmdirect_mvp",
  JWT_SECRET: process.env.JWT_SECRET || "farmdirect-dev-secret-change-me-2026",
  JWT_EXPIRES_IN: "24h",
  PYTHON_AI_BASE_URL: process.env.PYTHON_AI_BASE_URL || "http://127.0.0.1:5000/internal/ai",
};
