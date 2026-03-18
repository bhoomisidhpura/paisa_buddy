import mongoose from "mongoose";

// --- Scenario Schema ---
const scenarioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }, // the scam message/situation
    fraudType: { type: String, required: true }, // UPI, Phishing, etc.
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    options: [{ type: String, required: true }], // 3 options
    correctIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    xpReward: { type: Number, default: 50 },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// --- User Awareness Progress Schema ---
const awarenessProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    score: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    completedScenarios: [
      {
        scenarioId: { type: mongoose.Schema.Types.ObjectId, ref: "FraudScenario" },
        answeredCorrectly: { type: Boolean },
        attemptedAt: { type: Date, default: Date.now },
        timeTaken: { type: Number, default: 0 }, // seconds
      },
    ],
  },
  { timestamps: true }
);

export const FraudScenario = mongoose.model("FraudScenario", scenarioSchema);
export const AwarenessProgress = mongoose.model("AwarenessProgress", awarenessProgressSchema);