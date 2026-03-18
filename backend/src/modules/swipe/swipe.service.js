import { SwipeCard, SwipeProgress } from "./swipe.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

const SWIPE_XP_PER_LEVEL = 300;

const getOrCreateProgress = async (userId) => {
  let progress = await SwipeProgress.findOne({ user: userId });
  if (!progress) progress = await SwipeProgress.create({ user: userId });
  return progress;
};

// Get next unswiped card for the user
export const getNextCard = async (userId) => {
  const progress = await getOrCreateProgress(userId);
  const swipedIds = progress.swipedCards.map((s) => s.cardId.toString());

  const card = await SwipeCard.findOne({
    isActive: true,
    _id: { $nin: swipedIds },
  }).sort("order");

  if (!card) {
    return { finished: true, message: "You've completed all scenarios! More coming soon." };
  }

  return {
    finished: false,
    card: {
      _id: card._id,
      title: card.title,
      scenario: card.scenario,
      icon: card.icon,
      category: card.category,
      difficulty: card.difficulty,
      xpReward: card.xpReward,
      // correctChoice NOT sent to frontend
    },
  };
};

// Submit a swipe decision
export const submitSwipe = async (userId, cardId, choice) => {
  const card = await SwipeCard.findById(cardId);
  if (!card) throw new Error("Card not found");

  const progress = await getOrCreateProgress(userId);

  // Check if already swiped
  const alreadySwiped = progress.swipedCards.some(
    (s) => s.cardId.toString() === cardId
  );
  if (alreadySwiped) throw new Error("Already swiped this card");

  const isCorrect = choice === card.correctChoice;

  // Update progress
  progress.swipedCards.push({ cardId, choice, isCorrect });
  progress.totalSwiped += 1;

  if (isCorrect) {
    progress.totalCorrect += 1;
    progress.currentStreak += 1;
    if (progress.currentStreak > progress.bestStreak) {
      progress.bestStreak = progress.currentStreak;
    }
    progress.xp += card.xpReward;
  } else {
    progress.currentStreak = 0;
  }

  progress.level = Math.floor(progress.xp / SWIPE_XP_PER_LEVEL) + 1;
  await progress.save();

  // Gamification reward for correct answer
  if (isCorrect) {
    await rewardUser(userId, "QUIZ_COMPLETED", "quizzesCompleted");
  }

  return {
    isCorrect,
    correctChoice: card.correctChoice,
    explanation: card.explanation,
    tip: card.tip,
    xpEarned: isCorrect ? card.xpReward : 0,
    currentStreak: progress.currentStreak,
    level: progress.level,
  };
};

// Get user's swipe stats
export const getSwipeStats = async (userId) => {
  const progress = await getOrCreateProgress(userId);
  const accuracy = progress.totalSwiped > 0
    ? Math.round((progress.totalCorrect / progress.totalSwiped) * 100)
    : 0;

  return {
    totalSwiped: progress.totalSwiped,
    totalCorrect: progress.totalCorrect,
    accuracy,
    currentStreak: progress.currentStreak,
    bestStreak: progress.bestStreak,
    level: progress.level,
    xp: progress.xp,
    xpToNextLevel: progress.level * SWIPE_XP_PER_LEVEL - progress.xp,
  };
};