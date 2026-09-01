import mongoose from "mongoose";

const CROP_ENUMS = ["tomato", "potato", "onion", "brinjal", "ladiesfinger"];

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
      index: true,
    },
    crop: { type: String, enum: CROP_ENUMS, required: true },
    name: { type: String, required: true },
    emoji: { type: String, required: true },
    quantityKg: { type: Number, required: true, min: 0 },
    originalQuantityKg: { type: Number, required: true, min: 0 },
    pricePerKg: { type: Number, required: true, min: 1 },
    unit: { type: String, enum: ["kg"], default: "kg" },
    harvestDate: Date,
    imageUrl: String,
    aiDemandLevel: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
    },
    aiRecommendedPrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ crop: 1, isActive: 1 });
productSchema.index({ pricePerKg: 1 });

export default mongoose.model("Product", productSchema);
export { CROP_ENUMS };
