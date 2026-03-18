import mongoose from "mongoose";

const creditProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    creditScore: { type: Number, default: 0 }, // 300-900
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    emiCalculations: [
      {
        loanType: String,
        principal: Number,
        interestRate: Number,
        tenureMonths: Number,
        emi: Number,
        totalPayment: Number,
        totalInterest: Number,
        calculatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const CreditProfile = mongoose.model("CreditProfile", creditProfileSchema);