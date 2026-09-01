import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fpoName: String,
    farmSizeAcres: Number,
    primaryCrops: [String],
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Farmer", farmerSchema);
