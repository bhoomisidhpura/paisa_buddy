import {
    getAllModules,
    getModuleById,
    completeLesson,
    getQuiz,
    submitQuiz,
    getLearningStats,
  } from "./learning.service.js";
  import { LearningModule } from "./learning.model.js";
  
  // GET /api/learning/modules
  export const getModules = async (req, res) => {
    try {
      const modules = await getAllModules(req.user._id);
      res.status(200).json({ success: true, data: modules });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // GET /api/learning/modules/:moduleId
  export const getModule = async (req, res) => {
    try {
      const mod = await getModuleById(req.params.moduleId, req.user._id);
      res.status(200).json({ success: true, data: mod });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };
  
  // POST /api/learning/modules/:moduleId/lessons/:lessonId/complete
  export const markLessonComplete = async (req, res) => {
    try {
      const result = await completeLesson(
        req.user._id,
        req.params.moduleId,
        req.params.lessonId
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // GET /api/learning/modules/:moduleId/quiz
  export const getModuleQuiz = async (req, res) => {
    try {
      const questions = await getQuiz(req.params.moduleId);
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };
  
  // POST /api/learning/modules/:moduleId/quiz/submit
  // Body: { answers: [{ questionId, selectedIndex }] }
  export const submitModuleQuiz = async (req, res) => {
    try {
      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "answers array is required" });
      }
      const result = await submitQuiz(req.user._id, req.params.moduleId, answers);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // GET /api/learning/stats
  export const getStats = async (req, res) => {
    try {
      const stats = await getLearningStats(req.user._id);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // POST /api/learning/modules (admin only - seed a module)
  export const createModule = async (req, res) => {
    try {
      const mod = await LearningModule.create(req.body);
      res.status(201).json({ success: true, data: mod });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };