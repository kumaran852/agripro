import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Buyer from "../models/Buyer.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Delivery from "../models/Delivery.js";
import { callPrice, callRoute } from "../services/pythonAiClient.js";

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/farmdirect_mvp";
const PWHASH = (p) => bcrypt.hash(p, 6);

const FARMERS = [
  {
    user: {
      role: "farmer",
      name: "Ramesh FPO",
      email: "ramesh@farmdirect.ai",
      password: "farm1234",
      phone: "+91 9800000011",
      location: { district: "Tiruppur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411 },
    },
    profile: {
      fpoName: "Tiruppur Tomato FPO",
      farmSizeAcres: 24,
      primaryCrops: ["tomato", "onion", "brinjal"],
      rating: 4.6,
      totalRevenue: 24500,
    },
  },
  {
    user: {
      role: "farmer",
      name: "Lakshmi Krishnan",
      email: "lakshmi@farmdirect.ai",
      password: "farm1234",
      phone: "+91 9800000022",
      location: { district: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
    },
    profile: {
      fpoName: null,
      farmSizeAcres: 8.5,
      primaryCrops: ["potato", "brinjal", "ladiesfinger"],
      rating: 4.3,
      totalRevenue: 12800,
    },
  },
];

const BUYERS = [
  {
    user: {
      role: "buyer",
      name: "Priya's Kitchen",
      email: "priya@farmdirect.ai",
      password: "buy1234",
      phone: "+91 9900000011",
      location: { district: "Tiruppur", state: "Tamil Nadu", lat: 11.1200, lng: 77.3500 },
    },
    profile: { businessType: "restaurant", gstin: "33AABCT1234K1Z5", totalSpend: 3400 },
  },
  {
    user: {
      role: "buyer",
      name: "Namdev Kirana Store",
      email: "namdev@farmdirect.ai",
      password: "buy1234",
      phone: "+91 9900000022",
      location: { district: "Tiruppur", state: "Tamil Nadu", lat: 11.085, lng: 77.3720 },
    },
    profile: { businessType: "retail", gstin: "33BBCDN5678J2Z1", totalSpend: 7200 },
  },
  {
    user: {
      role: "buyer",
      name: "Anna University Canteen",
      email: "annauni@farmdirect.ai",
      password: "buy1234",
      phone: "+91 9900000033",
      location: { district: "Coimbatore", state: "Tamil Nadu", lat: 10.9955, lng: 76.9672 },
    },
    profile: { businessType: "institution", gstin: "33AAAUA9999G1Z9", totalSpend: 18500 },
  },
  {
    user: {
      role: "buyer",
      name: "Sri Venkateswara Mess",
      email: "sri@farmdirect.ai",
      password: "buy1234",
      phone: "+91 9900000044",
      location: { district: "Tiruppur", state: "Tamil Nadu", lat: 11.1000, lng: 77.3600 },
    },
    profile: { businessType: "restaurant", gstin: null, totalSpend: 900 },
  },
  {
    user: {
      role: "buyer",
      name: "GreenMart Wholesale",
      email: "greenmart@farmdirect.ai",
      password: "buy1234",
      phone: "+91 9900000055",
      location: { district: "Coimbatore", state: "Tamil Nadu", lat: 11.0050, lng: 76.9400 },
    },
    profile: { businessType: "wholesale", gstin: "33AAGCD8888H3Z3", totalSpend: 14000 },
  },
  {
    user: {
      role: "admin",
      name: "Demo Admin",
      email: "admin@farmdirect.ai",
      password: "admin1234",
      location: { district: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
    },
    profile: null,
  },
];

const PRODUCTS = (f1, f2) => [
  { farmerId: f1, crop: "tomato", name: "Hybrid Tomato (Desi)", emoji: "🍅", quantityKg: 500, pricePerKg: 25, aiDemandLevel: "HIGH", aiRecommendedPrice: 25 },
  { farmerId: f1, crop: "tomato", name: "Cherry Tomato", emoji: "🍅", quantityKg: 120, pricePerKg: 45, aiDemandLevel: "HIGH", aiRecommendedPrice: 48 },
  { farmerId: f1, crop: "onion", name: "Small Onion (Shallot)", emoji: "🧅", quantityKg: 180, pricePerKg: 28, aiDemandLevel: "HIGH", aiRecommendedPrice: 30 },
  { farmerId: f1, crop: "onion", name: "Big Onion Red", emoji: "🧅", quantityKg: 300, pricePerKg: 22, aiDemandLevel: "MEDIUM", aiRecommendedPrice: 23 },
  { farmerId: f1, crop: "brinjal", name: "Purple Brinjal Long", emoji: "🍆", quantityKg: 150, pricePerKg: 30, aiDemandLevel: "MEDIUM", aiRecommendedPrice: 30 },
  { farmerId: f1, crop: "ladiesfinger", name: "Fresh Ladies Finger", emoji: "🫛", quantityKg: 95, pricePerKg: 38, aiDemandLevel: "HIGH", aiRecommendedPrice: 40 },
  { farmerId: f1, crop: "potato", name: "Himalayan Potato", emoji: "🥔", quantityKg: 140, pricePerKg: 32, aiDemandLevel: "MEDIUM", aiRecommendedPrice: 30 },
  { farmerId: f2, crop: "potato", name: "Ooty Potato", emoji: "🥔", quantityKg: 320, pricePerKg: 30, aiDemandLevel: "MEDIUM", aiRecommendedPrice: 29 },
  { farmerId: f2, crop: "potato", name: "Chandramukhi Potato", emoji: "🥔", quantityKg: 80, pricePerKg: 34, aiDemandLevel: "LOW", aiRecommendedPrice: 31 },
  { farmerId: f2, crop: "brinjal", name: "Green Brinjal", emoji: "🍆", quantityKg: 220, pricePerKg: 32, aiDemandLevel: "MEDIUM", aiRecommendedPrice: 32 },
  { farmerId: f2, crop: "brinjal", name: "Round Purple Brinjal", emoji: "🍆", quantityKg: 160, pricePerKg: 28, aiDemandLevel: "LOW", aiRecommendedPrice: 27 },
  { farmerId: f2, crop: "ladiesfinger", name: "Organic Bhindi", emoji: "🫛", quantityKg: 180, pricePerKg: 35, aiDemandLevel: "MEDIUM", aiRecommendedPrice: 35 },
  { farmerId: f2, crop: "tomato", name: "Namdhari Tomato", emoji: "🍅", quantityKg: 240, pricePerKg: 23, aiDemandLevel: "HIGH", aiRecommendedPrice: 25 },
  { farmerId: f2, crop: "onion", name: "Bellary Onion", emoji: "🧅", quantityKg: 210, pricePerKg: 26, aiDemandLevel: "MEDIUM", aiRecommendedPrice: 26 },
  { farmerId: f1, crop: "tomato", name: "Organic Heirloom Tomato", emoji: "🍅", quantityKg: 70, pricePerKg: 55, aiDemandLevel: "HIGH", aiRecommendedPrice: 60 },
];

async function clear() {
  await User.deleteMany({});
  await Farmer.deleteMany({});
  await Buyer.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Delivery.deleteMany({});
}

async function main() {
  await mongoose.connect(MONGO, { serverSelectionTimeoutMS: 5000 });
  console.log("[seed] connected to", MONGO);
  await clear();

  const createdFarmers = [];
  for (const f of FARMERS) {
    const pw = await PWHASH(f.user.password);
    const u = await User.create({ ...f.user, passwordHash: pw });
    const fr = await Farmer.create({ userId: u._id, ...f.profile });
    createdFarmers.push({ user: u, farmer: fr });
  }

  const createdBuyers = [];
  for (const b of BUYERS) {
    const pw = await PWHASH(b.user.password);
    const u = await User.create({ ...b.user, passwordHash: pw });
    let pr = null;
    if (b.profile) {
      pr = await Buyer.create({ userId: u._id, ...b.profile });
    }
    createdBuyers.push({ user: u, buyer: pr });
  }

  const [fr1, fr2] = createdFarmers;
  const [bPriya, bNamdev, bAnna, bSri, bGreen] = createdBuyers;

  const productsData = PRODUCTS(fr1.farmer._id, fr2.farmer._id);
  const enriched = await Promise.all(
    productsData.map(async (p) => {
      const f = await callPrice(p.crop, p.quantityKg);
      return {
        ...p,
        originalQuantityKg: p.quantityKg,
        aiDemandLevel: f.demandLevel ?? p.aiDemandLevel,
        aiRecommendedPrice: f.recommendedPrice ?? p.aiRecommendedPrice,
      };
    })
  );
  const createdProducts = await Product.insertMany(enriched);

  const byName = Object.fromEntries(createdProducts.map((p) => [p.name, p]));
  const findP = (name) => byName[name];

  const makeOrder = async (buyer, productName, qty, status, farmer) => {
    const p = findP(productName);
    const total = Math.round(qty * p.pricePerKg);
    const hist = [{ status: "PENDING", at: new Date(Date.now() - 86400000) }];
    if (status !== "PENDING") hist.push({ status, at: new Date(Date.now() - 3600000) });
    return Order.create({
      buyerId: buyer.buyer._id,
      farmerId: farmer ?? p.farmerId,
      productId: p._id,
      quantityKg: qty,
      pricePerKgAtOrder: p.pricePerKg,
      totalAmount: total,
      status,
      statusHistory: hist,
    });
  };

  const o1020 = await makeOrder(bNamdev, "Ooty Potato", 80, "DELIVERED", fr2.farmer._id);
  const o1021 = await makeOrder(bPriya, "Small Onion (Shallot)", 50, "IN_TRANSIT", fr1.farmer._id);
  const o1022 = await makeOrder(bAnna, "Hybrid Tomato (Desi)", 100, "ACCEPTED", fr1.farmer._id);
  const o1023 = await makeOrder(bPriya, "Green Brinjal", 60, "PENDING", fr2.farmer._id);
  const o1024 = await makeOrder(bPriya, "Hybrid Tomato (Desi)", 100, "PENDING", fr1.farmer._id);

  await Order.updateOne({ _id: o1020._id }, { $set: { shortId: "ORD-1020" } });
  await Order.updateOne({ _id: o1021._id }, { $set: { shortId: "ORD-1021" } });
  await Order.updateOne({ _id: o1022._id }, { $set: { shortId: "ORD-1022" } });
  await Order.updateOne({ _id: o1023._id }, { $set: { shortId: "ORD-1023" } });
  await Order.updateOne({ _id: o1024._id }, { $set: { shortId: "ORD-1024" } });

  const stopOrders = [o1022, o1023, o1024, o1021];
  const depot = { lat: fr1.user.location.lat, lng: fr1.user.location.lng };
  const buyerLocs = {
    [bAnna.buyer._id.toString()]: bAnna.user.location,
    [bSri.buyer._id.toString()]: bSri.user.location,
    [bPriya.buyer._id.toString()]: bPriya.user.location,
    [bNamdev.buyer._id.toString()]: bNamdev.user.location,
    [bGreen.buyer._id.toString()]: bGreen.user.location,
  };
  const stopList = await Promise.all(
    stopOrders.map(async (o) => {
      const b = await Buyer.findById(o.buyerId).populate("userId").lean();
      const loc = buyerLocs[o.buyerId.toString()] || b?.userId?.location || { lat: 11.1, lng: 77.35 };
      return {
        id: o._id.toString(),
        name: b?.userId?.name || "Buyer",
        lat: loc.lat,
        lng: loc.lng,
        qtyKg: o.quantityKg,
        orderId: o.shortId,
      };
    })
  );
  const extraDemoStops = [
    {
      id: bSri.buyer._id.toString() + "_demo",
      name: "Sri Venkateswara Mess",
      lat: bSri.user.location.lat,
      lng: bSri.user.location.lng,
      qtyKg: 40,
      orderId: "ORD-1025",
    },
    {
      id: bGreen.buyer._id.toString() + "_demo",
      name: "GreenMart Wholesale",
      lat: bGreen.user.location.lat,
      lng: bGreen.user.location.lng,
      qtyKg: 150,
      orderId: "ORD-1026",
    },
  ];
  const routeResult = await callRoute({
    depot,
    stops: [...stopList.slice(0, 3), ...extraDemoStops],
  });
  await Delivery.create({
    orderIds: stopOrders.map((o) => o._id),
    depotFarmerId: fr1.farmer._id,
    routeOptimizedStops: routeResult.stops,
    distanceKm: routeResult.optimizedKm,
    estimatedMinutes: routeResult.optimizedMin,
    baselineDistanceKm: routeResult.baselineKm,
    baselineMinutes: routeResult.baselineMin,
    distanceSavedPct: routeResult.distanceSavedPct,
    timeSavedPct: routeResult.timeSavedPct,
    status: "SCHEDULED",
  });

  console.log(`[seed] done
  Users: ${await User.countDocuments()}
  Farmers: ${await Farmer.countDocuments()}
  Buyers: ${await Buyer.countDocuments()}
  Products: ${await Product.countDocuments()}
  Orders: ${await Order.countDocuments()}
  Deliveries: ${await Delivery.countDocuments()}

  Demo logins:
    Farmer  ramesh@farmdirect.ai  / farm1234
    Farmer  lakshmi@farmdirect.ai / farm1234
    Buyer   priya@farmdirect.ai   / buy1234
    Buyer   annauni@farmdirect.ai / buy1234
    Buyer   namdev@farmdirect.ai  / buy1234
    Admin   admin@farmdirect.ai   / admin1234
`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("[seed:fail]", e);
  process.exit(1);
});
