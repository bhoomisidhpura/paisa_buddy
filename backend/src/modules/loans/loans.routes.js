import express from "express";
import { dashboard, loanTypes, setCreditScore, emiCalculator } from "./loans.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.get("/", dashboard);
router.get("/types", loanTypes);
router.put("/credit-score", setCreditScore);
router.post("/emi-calculator", emiCalculator);

export default router;