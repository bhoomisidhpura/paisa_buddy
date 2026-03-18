import express from "express";
import { nextCard, swipe, stats } from "./swipe.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.get("/next", nextCard);
router.get("/stats", stats);
router.post("/:cardId", swipe);

export default router;