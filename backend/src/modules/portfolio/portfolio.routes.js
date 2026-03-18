import express from "express";
import { getPortfolio, getStocks, buy, sell } from "./portfolio.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getPortfolio);
router.get("/stocks", getStocks);
router.post("/buy", buy);
router.post("/sell", sell);

export default router;