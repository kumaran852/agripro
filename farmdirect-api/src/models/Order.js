import mongoose from "mongoose";

const STATUS_ENUMS = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: STATUS_ENUMS, required: true },
  at: { type: Date, default: Date.now },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  note: String,
});

const orderSchema = new mongoose.Schema(
  {
    shortId: { type: String, required: true, unique: true },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantityKg: { type: Number, required: true, min: 1 },
    pricePerKgAtOrder: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: STATUS_ENUMS, default: "PENDING" },
    statusHistory: [statusHistorySchema],
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
  },
  { timestamps: true }
);

let counter = 1000;
orderSchema.pre("validate", function (next) {
  if (!this.shortId) {
    counter += 1;
    this.shortId = `ORD-${counter}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);
export { STATUS_ENUMS };
