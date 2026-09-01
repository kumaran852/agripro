import { callPrice } from "./pythonAiClient.js";

export async function getForecast(crop, supplyKg = 500) {
  return callPrice(crop, supplyKg);
}

export async function getBatchForecast(crops = []) {
  const unique = [...new Set(crops.filter(Boolean))];
  const results = await Promise.all(unique.map((c) => callPrice(c, 500)));
  return results;
}
