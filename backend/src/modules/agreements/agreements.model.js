import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, default: "" },
});

const agreementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "📄" },
    riskLevel: { type: String, enum: ["Low", "Medium", "High"], required: true },
    category: { type: String, required: true },
    keyTerms: [{ type: String }],
    studyContent: { type: String, required: true }, // detailed markdown content
    redFlags: [{ type: String }], // things to watch out for
    quiz: [quizSchema],
    xpReward: { type: Number, default: 100 },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const agreementProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    masteredAgreements: [
      {
        agreementId: { type: mongoose.Schema.Types.ObjectId, ref: "Agreement" },
        masteredAt: { type: Date, default: Date.now },
        quizScore: { type: Number, default: 0 },
      },
    ],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Agreement = mongoose.model("Agreement", agreementSchema);
export const AgreementProgress = mongoose.model("AgreementProgress", agreementProgressSchema);