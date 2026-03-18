import express from "express";
import { getGamificationProfile, awardReward } from "./gamification.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All gamification routes are protected
router.use(protect);

router.get("/profile", getGamificationProfile);
router.post("/reward", awardReward);

export default router;