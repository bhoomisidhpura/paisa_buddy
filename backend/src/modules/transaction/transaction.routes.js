import { Router } from "express";
import {
  addTransaction,
  getTransactions,
  categoryBreakdown,
  lastSixMonthsTrend,
} from "./transaction.controller.js";
import { protect } from "../../middleware/auth.middleware.js";


const router = Router();

router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.get("/summary/categories", protect, categoryBreakdown);
router.get("/summary/trend", protect, lastSixMonthsTrend);

export default router;