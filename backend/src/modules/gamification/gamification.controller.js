import { getProfile, rewardUser } from "./gamification.service.js";

// GET /api/gamification/profile
export const getGamificationProfile = async (req, res) => {
  try {
    const profile = await getProfile(req.user._id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/gamification/reward
// Body: { action: "LESSON_COMPLETED", statKey: "lessonsCompleted" }
export const awardReward = async (req, res) => {
  try {
    const { action, statKey } = req.body;
    if (!action) {
      return res.status(400).json({ message: "action is required" });
    }
    const result = await rewardUser(req.user._id, action, statKey);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};