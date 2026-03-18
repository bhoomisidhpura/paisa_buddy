import {
    getBudget, setIncome, upsertExpense, deleteExpense,
    addSavingsGoal, contributeToGoal, deleteSavingsGoal, getBudgetHistory,
  } from "./budget.service.js";
  
  const getCurrentMonthYear = () => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  };
  
  const parseMonthYear = (req) => {
    const { month, year } = req.query;
    if (month && year) return { month: parseInt(month), year: parseInt(year) };
    return getCurrentMonthYear();
  };
  
  // GET /api/budget?month=2&year=2026
  export const getBudgetHandler = async (req, res) => {
    try {
      const { month, year } = parseMonthYear(req);
      const data = await getBudget(req.user._id, month, year);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // PUT /api/budget/income
  // Body: { income: 50000, month?: 2, year?: 2026 }
  export const setIncomeHandler = async (req, res) => {
    try {
      const { income, month, year } = req.body;
      if (!income) return res.status(400).json({ message: "income is required" });
      const { month: m, year: y } = month && year ? { month, year } : getCurrentMonthYear();
      const data = await setIncome(req.user._id, m, y, income);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // POST /api/budget/expenses
  // Body: { category: "Rent", amount: 15000, limit: 15000 }
  export const upsertExpenseHandler = async (req, res) => {
    try {
      const { category, amount, limit, month, year } = req.body;
      if (!category || amount === undefined) {
        return res.status(400).json({ message: "category and amount are required" });
      }
      const { month: m, year: y } = month && year ? { month, year } : getCurrentMonthYear();
      const data = await upsertExpense(req.user._id, m, y, { category, amount, limit });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // DELETE /api/budget/expenses/:expenseId
  export const deleteExpenseHandler = async (req, res) => {
    try {
      const { month, year } = parseMonthYear(req);
      const data = await deleteExpense(req.user._id, month, year, req.params.expenseId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // POST /api/budget/goals
  // Body: { name: "Emergency Fund", targetAmount: 150000, icon: "🛡️" }
  export const addGoalHandler = async (req, res) => {
    try {
      const { name, targetAmount, icon, autoAllocate, month, year } = req.body;
      if (!name || !targetAmount) {
        return res.status(400).json({ message: "name and targetAmount are required" });
      }
      const { month: m, year: y } = month && year ? { month, year } : getCurrentMonthYear();
      const data = await addSavingsGoal(req.user._id, m, y, { name, targetAmount, icon, autoAllocate });
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // POST /api/budget/goals/:goalId/contribute
  // Body: { amount: 5000 }
  export const contributeGoalHandler = async (req, res) => {
    try {
      const { amount, month, year } = req.body;
      if (!amount) return res.status(400).json({ message: "amount is required" });
      const { month: m, year: y } = month && year ? { month, year } : getCurrentMonthYear();
      const data = await contributeToGoal(req.user._id, m, y, req.params.goalId, amount);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // DELETE /api/budget/goals/:goalId
  export const deleteGoalHandler = async (req, res) => {
    try {
      const { month, year } = parseMonthYear(req);
      const data = await deleteSavingsGoal(req.user._id, month, year, req.params.goalId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // GET /api/budget/history
  export const historyHandler = async (req, res) => {
    try {
      const data = await getBudgetHistory(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };