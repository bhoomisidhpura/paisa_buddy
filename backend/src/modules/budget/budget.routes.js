import express from "express";
import {
  getBudgetHandler, setIncomeHandler, upsertExpenseHandler, deleteExpenseHandler,
  addGoalHandler, contributeGoalHandler, deleteGoalHandler, historyHandler,
} from "./budget.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getBudgetHandler);
router.get("/history", historyHandler);
router.put("/income", setIncomeHandler);
router.post("/expenses", upsertExpenseHandler);
router.delete("/expenses/:expenseId", deleteExpenseHandler);
router.post("/goals", addGoalHandler);
router.post("/goals/:goalId/contribute", contributeGoalHandler);
router.delete("/goals/:goalId", deleteGoalHandler);

export default router;