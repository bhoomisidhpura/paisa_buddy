import {
    getScenarios,
    submitAnswer,
    getAwarenessProfile,
    getLeaderboard,
  } from "./fraudAwareness.service.js";
  import { FraudScenario } from "./fraudAwareness.model.js";
  
  // GET /api/fraud-awareness/scenarios
  export const listScenarios = async (req, res) => {
    try {
      const scenarios = await getScenarios(req.user._id);
      res.status(200).json({ success: true, data: scenarios });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // POST /api/fraud-awareness/scenarios/:scenarioId/answer
  // Body: { selectedIndex: 1, timeTaken: 4 }
  export const answerScenario = async (req, res) => {
    try {
      const { selectedIndex, timeTaken } = req.body;
      if (selectedIndex === undefined) {
        return res.status(400).json({ message: "selectedIndex is required" });
      }
      const result = await submitAnswer(
        req.user._id,
        req.params.scenarioId,
        selectedIndex,
        timeTaken || 0
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // GET /api/fraud-awareness/profile
  export const profile = async (req, res) => {
    try {
      const data = await getAwarenessProfile(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // GET /api/fraud-awareness/leaderboard
  export const leaderboard = async (req, res) => {
    try {
      const data = await getLeaderboard();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // POST /api/fraud-awareness/scenarios (admin - seed scenarios)
  export const createScenario = async (req, res) => {
    try {
      const scenario = await FraudScenario.create(req.body);
      res.status(201).json({ success: true, data: scenario });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };