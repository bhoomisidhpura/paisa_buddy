import express from "express";
import {
  listScenarios,
  answerScenario,
  profile,
  leaderboard,
  createScenario,
} from "./fraudAwareness.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/scenarios", listScenarios);
router.post("/scenarios", createScenario); // admin: seed scenarios
router.post("/scenarios/:scenarioId/answer", answerScenario);
router.get("/profile", profile);
router.get("/leaderboard", leaderboard);

export default router;