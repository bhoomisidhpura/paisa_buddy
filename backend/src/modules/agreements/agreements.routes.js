import express from "express";
import { listAgreements, getAgreement, submitQuiz, agreementStats } from "./agreements.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.get("/", listAgreements);
router.get("/stats", agreementStats);
router.get("/:agreementId", getAgreement);
router.post("/:agreementId/quiz", submitQuiz);

export default router;