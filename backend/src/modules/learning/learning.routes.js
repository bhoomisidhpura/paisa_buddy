import express from "express";
import {
  getModules,
  getModule,
  markLessonComplete,
  getModuleQuiz,
  submitModuleQuiz,
  getStats,
  createModule,
} from "./learning.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/modules", getModules);
router.post("/modules", createModule); // admin: seed modules
router.get("/modules/:moduleId", getModule);
router.post("/modules/:moduleId/lessons/:lessonId/complete", markLessonComplete);
router.get("/modules/:moduleId/quiz", getModuleQuiz);
router.post("/modules/:moduleId/quiz/submit", submitModuleQuiz);

export default router;