import express from "express";
import { treasureMap, unlock, schemeQuiz, stats, getScheme } from "./scheme.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.get("/", treasureMap);
router.get("/stats", stats);
router.get("/:schemeId", getScheme);
router.post("/:schemeId/unlock", unlock);
router.post("/:schemeId/quiz", schemeQuiz);

export default router;