import { Budget } from "./budget.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

const BUDGETER_XP_PER_LEVEL = 300;

const BUDGET_TIPS = (savingsRate) => {
  if (savingsRate >= 30) return "Excellent! You're saving 30%+ of your income. Consider investing in mutual funds via SIP!";
  if (savingsRate >= 20) return "Great job! You're saving 20%+ of your income. Try increasing your SIP by ₹500 this month.";
  if (savingsRate >= 10) return "Good start! Aim to save 20% of income. Try cutting entertainment or dining expenses.";
  if (savingsRate > 0) return "You're saving, but aim higher! Track daily expenses and find areas to cut back.";
  return "You're spending more than you earn! Review your expenses urgently and cut non-essential spending.";
};

const CATEGORY_ICONS = {
  Rent: "🏠", Food: "🍔", Transport: "🚗", Entertainment: "🎮",
  Shopping: "🛍️", Healthcare: "💊", Other: "💰",
};

// Get or create budget for current month
export const getOrCreateBudget = async (userId, month, year) => {
  let budget = await Budget.findOne({ user: userId, month, year });
  if (!budget) {
    budget = await Budget.create({
      user: userId, month, year,
      monthlyIncome: 0,
      expenses: [],
      savingsGoals: [],
    });
  }
  return budget;
};

// Get current month's budget with computed stats
export const getBudget = async (userId, month, year) => {
  const budget = await getOrCreateBudget(userId, month, year);
  return computeBudgetStats(budget);
};

const computeBudgetStats = (budget) => {
  const totalExpenses = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = budget.monthlyIncome - totalExpenses;
  const savingsRate = budget.monthlyIncome > 0
    ? Math.round((savings / budget.monthlyIncome) * 100 * 10) / 10
    : 0;

  const expenses = budget.expenses.map((e) => {
    const percentOfIncome = budget.monthlyIncome > 0
      ? Math.round((e.amount / budget.monthlyIncome) * 100 * 10) / 10
      : 0;
    const isOverLimit = e.limit > 0 && e.amount > e.limit;
    return {
      _id: e._id,
      category: e.category,
      amount: e.amount,
      limit: e.limit,
      icon: CATEGORY_ICONS[e.category] || "💰",
      percentOfIncome,
      isOverLimit,
      overBy: isOverLimit ? e.amount - e.limit : 0,
    };
  });

  const savingsGoals = budget.savingsGoals.map((g) => ({
    _id: g._id,
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    icon: g.icon,
    autoAllocate: g.autoAllocate,
    percentComplete: Math.round((g.currentAmount / g.targetAmount) * 100),
    remaining: g.targetAmount - g.currentAmount,
    isCompleted: !!g.completedAt,
  }));

  return {
    _id: budget._id,
    month: budget.month,
    year: budget.year,
    monthlyIncome: budget.monthlyIncome,
    totalExpenses,
    savings,
    savingsRate,
    budgetTip: BUDGET_TIPS(savingsRate),
    budgeterLevel: budget.budgeterLevel,
    budgeterXp: budget.budgeterXp,
    xpToNextLevel: budget.budgeterLevel * BUDGETER_XP_PER_LEVEL - budget.budgeterXp,
    expenses,
    savingsGoals,
    warnings: expenses.filter((e) => e.isOverLimit).map((e) =>
      `⚠️ ${e.category} is ₹${e.overBy} over your set limit!`
    ),
  };
};

// Set monthly income
export const setIncome = async (userId, month, year, income) => {
  const budget = await getOrCreateBudget(userId, month, year);
  budget.monthlyIncome = income;
  await budget.save();
  return computeBudgetStats(budget);
};

// Add or update an expense category
export const upsertExpense = async (userId, month, year, { category, amount, limit }) => {
  const budget = await getOrCreateBudget(userId, month, year);

  const existing = budget.expenses.find((e) => e.category === category);
  if (existing) {
    existing.amount = amount;
    if (limit !== undefined) existing.limit = limit;
  } else {
    budget.expenses.push({ category, amount, limit: limit || 0 });
    // Reward for adding first expense
    budget.budgeterXp += 30;
    budget.budgeterLevel = Math.floor(budget.budgeterXp / BUDGETER_XP_PER_LEVEL) + 1;
    await rewardUser(userId, "BUDGET_CREATED", "budgetsCreated");
  }

  await budget.save();
  return computeBudgetStats(budget);
};

// Delete an expense category
export const deleteExpense = async (userId, month, year, expenseId) => {
  const budget = await getOrCreateBudget(userId, month, year);
  budget.expenses = budget.expenses.filter((e) => e._id.toString() !== expenseId);
  await budget.save();
  return computeBudgetStats(budget);
};

// Add a savings goal
export const addSavingsGoal = async (userId, month, year, { name, targetAmount, icon, autoAllocate }) => {
  const budget = await getOrCreateBudget(userId, month, year);
  budget.savingsGoals.push({ name, targetAmount, icon: icon || "🎯", autoAllocate: autoAllocate || false });
  budget.budgeterXp += 50;
  budget.budgeterLevel = Math.floor(budget.budgeterXp / BUDGETER_XP_PER_LEVEL) + 1;
  await budget.save();
  await rewardUser(userId, "BUDGET_CREATED", "budgetsCreated");
  return computeBudgetStats(budget);
};

// Add amount to a savings goal
export const contributeToGoal = async (userId, month, year, goalId, amount) => {
  const budget = await getOrCreateBudget(userId, month, year);
  const goal = budget.savingsGoals.id(goalId);
  if (!goal) throw new Error("Savings goal not found");

  goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
  if (goal.currentAmount >= goal.targetAmount && !goal.completedAt) {
    goal.completedAt = new Date();
    budget.budgeterXp += 100; // bonus XP for completing a goal
    budget.budgeterLevel = Math.floor(budget.budgeterXp / BUDGETER_XP_PER_LEVEL) + 1;
  }

  await budget.save();
  return computeBudgetStats(budget);
};

// Delete a savings goal
export const deleteSavingsGoal = async (userId, month, year, goalId) => {
  const budget = await getOrCreateBudget(userId, month, year);
  budget.savingsGoals = budget.savingsGoals.filter((g) => g._id.toString() !== goalId);
  await budget.save();
  return computeBudgetStats(budget);
};

// Get budget history (last 6 months)
export const getBudgetHistory = async (userId) => {
  const budgets = await Budget.find({ user: userId }).sort({ year: -1, month: -1 }).limit(6);
  return budgets.map((b) => {
    const totalExpenses = b.expenses.reduce((sum, e) => sum + e.amount, 0);
    const savings = b.monthlyIncome - totalExpenses;
    const savingsRate = b.monthlyIncome > 0 ? Math.round((savings / b.monthlyIncome) * 100) : 0;
    return { month: b.month, year: b.year, monthlyIncome: b.monthlyIncome, totalExpenses, savings, savingsRate };
  });
};