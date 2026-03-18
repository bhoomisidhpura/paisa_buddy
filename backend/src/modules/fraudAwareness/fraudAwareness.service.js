import { FraudScenario, AwarenessProgress } from "./fraudAwareness.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

const SCORE_PER_CORRECT = 100;
const STREAK_BONUS = 50;
const AWARENESS_XP_PER_LEVEL = 500;

const getOrCreateProgress = async (userId) => {
  let progress = await AwarenessProgress.findOne({ user: userId });
  if (!progress) {
    progress = await AwarenessProgress.create({ user: userId });
  }
  return progress;
};

// --- Get all scenarios with user progress ---
export const getScenarios = async (userId) => {
  const scenarios = await FraudScenario.find({ isActive: true }).sort("order");
  const progress = await getOrCreateProgress(userId);

  return scenarios.map((s) => {
    const completed = progress.completedScenarios.find(
      (c) => c.scenarioId.toString() === s._id.toString()
    );

    return {
      _id: s._id,
      title: s.title,
      description: s.description,
      fraudType: s.fraudType,
      difficulty: s.difficulty,
      options: s.options,
      xpReward: s.xpReward,
      order: s.order,
      // userProgress shape matches what frontend expects
      userProgress: completed
        ? {
            answered: true,
            answeredCorrectly: completed.answeredCorrectly,
          }
        : {
            answered: false,
            answeredCorrectly: false,
          },
    };
  });
};

// --- Submit answer for a scenario ---
export const submitAnswer = async (userId, scenarioId, selectedIndex, timeTaken = 0) => {
  const scenario = await FraudScenario.findById(scenarioId);
  if (!scenario) throw new Error("Scenario not found");

  const progress = await getOrCreateProgress(userId);

  // Check if already answered — prevent re-answering
  const alreadyAnswered = progress.completedScenarios.some(
    (c) => c.scenarioId.toString() === scenarioId
  );
  if (alreadyAnswered) {
    throw new Error("Scenario already answered");
  }

  const isCorrect = selectedIndex === scenario.correctIndex;

  // Update stats
  progress.totalAttempted += 1;
  let pointsEarned = 0;

  if (isCorrect) {
    progress.totalCorrect += 1;
    progress.streak += 1;

    // Score = base + streak bonus
    const streakBonus = progress.streak > 1 ? STREAK_BONUS * (progress.streak - 1) : 0;
    pointsEarned = SCORE_PER_CORRECT + streakBonus;
    progress.score += pointsEarned;
  } else {
    progress.streak = 0; // reset streak on wrong answer
  }

  // Level up
  progress.level = Math.floor(progress.score / AWARENESS_XP_PER_LEVEL) + 1;

  // Record this attempt
  progress.completedScenarios.push({
    scenarioId,
    answeredCorrectly: isCorrect,
    timeTaken,
  });

  await progress.save();

  // Gamification reward if correct
  if (isCorrect) {
    await rewardUser(userId, "FRAUD_DETECTED", "fraudDetected");
  }

  return {
    isCorrect,
    correctIndex: scenario.correctIndex,
    explanation: scenario.explanation,
    pointsEarned,           // ← frontend uses this for "+100 points!"
    score: progress.score,
    streak: progress.streak,
    level: progress.level,
  };
};

// --- Get user's awareness profile ---
export const getAwarenessProfile = async (userId) => {
  const progress = await getOrCreateProgress(userId);
  const accuracy =
    progress.totalAttempted > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
      : 0;

  return {
    score: progress.score,
    streak: progress.streak,
    level: progress.level,
    totalAttempted: progress.totalAttempted,
    totalCorrect: progress.totalCorrect,
    accuracy,
    rank: await getRank(userId, progress.score),
  };
};

// --- Get leaderboard ---
export const getLeaderboard = async () => {
  const top = await AwarenessProgress.find()
    .sort({ score: -1 })
    .limit(10)
    .populate("user", "name avatar");

  return top.map((p, index) => ({
    rank: index + 1,
    name: p.user?.name || "Unknown",
    avatar: p.user?.avatar || "",
    score: p.score,
    level: p.level,
    streak: p.streak,
  }));
};

// Helper: get user's rank
const getRank = async (userId, score) => {
  const higher = await AwarenessProgress.countDocuments({ score: { $gt: score } });
  return higher + 1;
};