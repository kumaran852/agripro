export type Role = "farmer" | "buyer" | "admin";

export interface Location {
  district: string;
  state: string;
  lat: number;
  lng: number;
}

export interface User {
  _id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  location: Location;
  profile?: FarmerProfile | BuyerProfile;
  createdAt?: string;
}

export interface FarmerProfile {
  _id: string;
  userId: string;
  fpoName?: string | null;
  farmSizeAcres?: number;
  primaryCrops?: string[];
  rating: number;
  totalRevenue: number;
}

export interface BuyerProfile {
  _id: string;
  userId: string;
  businessType: "restaurant" | "retail" | "wholesale" | "institution";
  gstin?: string | null;
  totalSpend: number;
}

export type CropId = "tomato" | "potato" | "onion" | "brinjal" | "ladiesfinger";
export type DemandLevel = "HIGH" | "MEDIUM" | "LOW";
export type SellVerdict = "GOOD" | "NEUTRAL" | "HOLD";

export interface Product {
  _id: string;
  farmerId:
    | string
    | ({
        _id: string;
        userId?: { _id?: string; name: string; location: Location };
        rating?: number;
        fpoName?: string | null;
      } & Partial<FarmerProfile>);
  crop: CropId;
  name: string;
  emoji: string;
  quantityKg: number;
  originalQuantityKg: number;
  pricePerKg: number;
  unit: "kg";
  harvestDate?: string;
  imageUrl?: string;
  aiDemandLevel: DemandLevel;
  aiRecommendedPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  _id: string;
  shortId: string;
  buyerId: string | { _id: string; userId?: { name: string; location: Location } };
  farmerId: string | { _id: string; userId?: { name: string; location: Location } };
  productId:
    | string
    | {
        _id: string;
        name: string;
        emoji: string;
        crop: CropId;
        pricePerKg: number;
      };
  quantityKg: number;
  pricePerKgAtOrder: number;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string; by?: string; note?: string }[];
  deliveryId?: string | null | { _id: string; estimatedMinutes?: number };
  createdAt: string;
  updatedAt: string;
}

export interface Forecast {
  crop: CropId;
  baselineMarketPrice: number;
  recommendedPrice: number;
  predictedDemandKg: number;
  currentSupplyKg: number;
  demandRatio: number;
  demandLevel: DemandLevel;
  supplyGapKg: number;
  sellVerdict: SellVerdict;
  trend7day: number[];
}

export interface RouteStop {
  seq: number;
  type: "DEPOT" | "BUYER";
  name: string;
  lat: number;
  lng: number;
  orderId: string | null;
  qtyKg: number;
}

export interface RouteResult {
  baselineKm: number;
  optimizedKm: number;
  baselineMin: number;
  optimizedMin: number;
  distanceSavedPct: number;
  timeSavedPct: number;
  stops: RouteStop[];
}

export interface Delivery {
  _id: string;
  orderIds: string[];
  depotFarmerId: string;
  routeOptimizedStops: RouteStop[];
  distanceKm: number;
  estimatedMinutes: number;
  baselineDistanceKm: number;
  baselineMinutes: number;
  distanceSavedPct: number;
  timeSavedPct: number;
  status: "SCHEDULED" | "ENROUTE" | "COMPLETED";
  scheduledAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
