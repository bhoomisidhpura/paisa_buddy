import mongoose from "mongoose";

const swipeCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    scenario: { type: String, required: true }, // full description shown on card
    icon: { type: String, default: "💰" },
    category: {
      type: String,
      enum: ["Spending", "Investing", "Saving", "Debt", "Insurance", "Tax"],
      required: true,
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    correctChoice: { type: String, enum: ["approve", "reject"], required: true },
    explanation: { type: String, required: true }, // shown after swipe
    tip: { type: String, default: "" }, // financial tip related to scenario
    xpReward: { type: Number, default: 30 },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const swipeProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    swipedCards: [
      {
        cardId: { type: mongoose.Schema.Types.ObjectId, ref: "SwipeCard" },
        choice: { type: String, enum: ["approve", "reject"] },
        isCorrect: { type: Boolean },
        swipedAt: { type: Date, default: Date.now },
      },
    ],
    totalSwiped: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SwipeCard = mongoose.model("SwipeCard", swipeCardSchema);
export const SwipeProgress = mongoose.model("SwipeProgress", swipeProgressSchema);