import { Scheme, SchemeProgress } from "./scheme.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

const getOrCreateProgress = async (userId) => {
  let progress = await SchemeProgress.findOne({ user: userId });
  if (!progress) progress = await SchemeProgress.create({ user: userId });
  return progress;
};

export const getTreasureMap = async (userId) => {
  const schemes = await Scheme.find({ isActive: true }).sort("order");
  const progress = await getOrCreateProgress(userId);
  const unlockedIds = progress.unlockedSchemes.map((u) => u.schemeId.toString());

  return schemes.map((s) => {
    const isUnlocked = unlockedIds.includes(s._id.toString());
    const unlockedEntry = progress.unlockedSchemes.find(
      (u) => u.schemeId.toString() === s._id.toString()
    );
    return {
      _id: s._id,
      isUnlocked,
      coinsReward: s.coinsReward,
      order: s.order,
      category: s.category,
      ...(isUnlocked
        ? {
            title: s.name,
            name: s.name,
            shortName: s.shortName,
            icon: s.icon,
            quizAnswered: unlockedEntry?.quizAnswered || false,
            quizCorrect: unlockedEntry?.quizCorrect || false,
          }
        : { name: "MYSTERY", shortName: "MYSTERY", icon: "📦" }),
    };
  });
};

// New: get full detail for an already-unlocked scheme
export const getSchemeDetail = async (userId, schemeId) => {
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) throw new Error("Scheme not found");

  const progress = await getOrCreateProgress(userId);
  const entry = progress.unlockedSchemes.find(
    (u) => u.schemeId.toString() === schemeId
  );
  if (!entry) throw new Error("Scheme not unlocked yet");

  return {
    _id: scheme._id,
    name: scheme.name,
    title: scheme.name,
    shortName: scheme.shortName,
    description: scheme.description,
    category: scheme.category,
    benefits: scheme.benefits,
    eligibility: scheme.eligibility,
    howToApply: scheme.howToApply,
    officialLink: scheme.officialLink,
    icon: scheme.icon,
    coinsReward: scheme.coinsReward,
    quizAnswered: entry.quizAnswered || false,
    quizCorrect: entry.quizCorrect || false,
    quiz: scheme.quiz
      ? { _id: scheme.quiz._id, question: scheme.quiz.question, options: scheme.quiz.options }
      : null,
  };
};

export const unlockScheme = async (userId, schemeId) => {
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) throw new Error("Scheme not found");

  const progress = await getOrCreateProgress(userId);
  const alreadyUnlocked = progress.unlockedSchemes.some(
    (u) => u.schemeId.toString() === schemeId
  );

  if (!alreadyUnlocked) {
    progress.unlockedSchemes.push({ schemeId });
    progress.totalCoinsEarned += scheme.coinsReward;
    progress.totalXpEarned += scheme.xpReward;
    await progress.save();
    await rewardUser(userId, "LESSON_COMPLETED", "lessonsCompleted");
  }

  return {
    _id: scheme._id,
    name: scheme.name,
    title: scheme.name,
    shortName: scheme.shortName,
    description: scheme.description,
    category: scheme.category,
    benefits: scheme.benefits,
    eligibility: scheme.eligibility,
    howToApply: scheme.howToApply,
    officialLink: scheme.officialLink,
    icon: scheme.icon,
    coinsReward: scheme.coinsReward,
    quiz: scheme.quiz
      ? { _id: scheme.quiz._id, question: scheme.quiz.question, options: scheme.quiz.options }
      : null,
    alreadyUnlocked,
  };
};

export const submitSchemeQuiz = async (userId, schemeId, selectedIndex) => {
  const scheme = await Scheme.findById(schemeId);
  if (!scheme || !scheme.quiz) throw new Error("Scheme or quiz not found");

  const progress = await getOrCreateProgress(userId);
  const entry = progress.unlockedSchemes.find(
    (u) => u.schemeId.toString() === schemeId
  );
  if (!entry) throw new Error("Unlock this scheme first");

  if (entry.quizAnswered) {
    return {
      alreadyAnswered: true,
      isCorrect: entry.quizCorrect,
      correctIndex: scheme.quiz.correctIndex,
      explanation: scheme.quiz.explanation,
    };
  }

  const isCorrect = selectedIndex === scheme.quiz.correctIndex;
  entry.quizAnswered = true;
  entry.quizCorrect = isCorrect;
  await progress.save();

  if (isCorrect) await rewardUser(userId, "QUIZ_COMPLETED", "quizzesCompleted");

  return {
    alreadyAnswered: false,
    isCorrect,
    correctIndex: scheme.quiz.correctIndex,
    explanation: scheme.quiz.explanation,
  };
};

export const getHuntStats = async (userId) => {
  const progress = await getOrCreateProgress(userId);
  const totalSchemes = await Scheme.countDocuments({ isActive: true });
  return {
    totalUnlocked: progress.unlockedSchemes.length,
    totalSchemes,
    totalCoinsEarned: progress.totalCoinsEarned,
    totalXpEarned: progress.totalXpEarned,
    completionPercent: Math.round((progress.unlockedSchemes.length / totalSchemes) * 100),
  };
};