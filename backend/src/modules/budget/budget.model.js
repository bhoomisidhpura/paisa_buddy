import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Rent", "Food", "Transport", "Entertainment", "Shopping", "Healthcare", "Other"],
    required: true,
  },
  amount: { type: Number, required: true },
  limit: { type: Number, default: 0 }, // 0 = no limit set
  icon: { type: String, default: "💰" },
});

const savingsGoalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  icon: { type: String, default: "🎯" },
  autoAllocate: { type: Boolean, default: false }, // auto add from savings each month
  completedAt: { type: Date, default: null },
});

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    monthlyIncome: { type: Number, required: true },
    expenses: [expenseSchema],
    savingsGoals: [savingsGoalSchema],

    // Budgeter gamification
    budgeterXp: { type: Number, default: 0 },
    budgeterLevel: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// One budget per user per month
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

export const Budget = mongoose.model("Budget", budgetSchema);