import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  avgBuyPrice: { type: Number, required: true }, // average cost per share
});

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    virtualBalance: { type: Number, default: 100000 }, // ₹1,00,000 starting cash

    holdings: { type: [holdingSchema], default: [] },

    totalInvested: { type: Number, default: 0 },

    // Investor level (separate from main XP level - tracks trading activity)
    investorXp: { type: Number, default: 0 },
    investorLevel: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);