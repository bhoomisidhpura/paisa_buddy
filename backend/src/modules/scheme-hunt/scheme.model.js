import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, default: "" },
});

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Business", "Education", "Housing", "Health", "Agriculture", "Women", "Youth", "Pension", "Insurance"],
      required: true,
    },
    benefits: [{ type: String }],
    eligibility: [{ type: String }],
    howToApply: { type: String, required: true },
    officialLink: { type: String, default: "" },
    icon: { type: String, default: "🏛️" },
    coinsReward: { type: Number, default: 200 },
    xpReward: { type: Number, default: 50 },
    quiz: quizSchema,
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const schemeProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    unlockedSchemes: [
      {
        schemeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme" },
        unlockedAt: { type: Date, default: Date.now },
        quizAnswered: { type: Boolean, default: false },
        quizCorrect: { type: Boolean, default: false },
      },
    ],
    totalCoinsEarned: { type: Number, default: 0 },
    totalXpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Scheme = mongoose.model("Scheme", schemeSchema);
export const SchemeProgress = mongoose.model("SchemeProgress", schemeProgressSchema);