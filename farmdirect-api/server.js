import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";

(async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[api] listening on :${env.PORT} — /v1/health`);
  });
})();
