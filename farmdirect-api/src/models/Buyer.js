import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessType: {
      type: String,
      enum: ["restaurant", "retail", "wholesale", "institution"],
      required: true,
    },
    gstin: String,
    totalSpend: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Buyer", buyerSchema);
