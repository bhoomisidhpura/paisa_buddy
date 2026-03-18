import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "🏆" },
  earnedAt: { type: Date, default: Date.now },
});

const gamificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // XP & Levels
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // In-app currency
    coins: { type: Number, default: 0 },

    // Badges earned
    badges: { type: [badgeSchema], default: [] },

    // Daily streak
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },

    // Stats used for badge unlocking
    stats: {
      lessonsCompleted: { type: Number, default: 0 },
      transactionsLogged: { type: Number, default: 0 },
      budgetsCreated: { type: Number, default: 0 },
      tradesExecuted: { type: Number, default: 0 },
      fraudDetected: { type: Number, default: 0 },
      quizzesCompleted: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Gamification = mongoose.model("Gamification", gamificationSchema);