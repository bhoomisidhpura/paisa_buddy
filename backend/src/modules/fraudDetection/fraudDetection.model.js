import mongoose from "mongoose";

const fraudScanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    verdict: {
      type: String,
      enum: ["FRAUD", "SUSPICIOUS", "SAFE"],
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      required: true,
    },
    confidence: { type: Number, required: true },
    fraudType: { type: String, default: null },
    redFlags: [{ type: String }],
    explanation: { type: String },
    advice: { type: String },
  },
  { timestamps: true }
);

export const FraudScan = mongoose.model("FraudScan", fraudScanSchema);