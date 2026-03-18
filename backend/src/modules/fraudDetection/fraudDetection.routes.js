import express from "express";
import { scan, history } from "./fraudDetection.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/scan", scan);
router.get("/history", history);

export default router;