import { Agreement, AgreementProgress } from "./agreements.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

const AGREEMENT_XP_PER_LEVEL = 400;

const getOrCreateProgress = async (userId) => {
  let progress = await AgreementProgress.findOne({ user: userId });
  if (!progress) progress = await AgreementProgress.create({ user: userId });
  return progress;
};

export const getAllAgreements = async (userId) => {
  const agreements = await Agreement.find({ isActive: true }).sort("order");
  const progress = await getOrCreateProgress(userId);
  const masteredIds = progress.masteredAgreements.map((m) => m.agreementId.toString());

  return agreements.map((a) => {
    const masteredEntry = progress.masteredAgreements.find(
      (m) => m.agreementId.toString() === a._id.toString()
    );
    return {
      _id: a._id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      riskLevel: a.riskLevel,
      category: a.category,
      keyTerms: a.keyTerms,
      redFlags: a.redFlags,
      xpReward: a.xpReward,
      order: a.order,
      isMastered: masteredIds.includes(a._id.toString()),
      quizScore: masteredEntry?.quizScore || 0,
    };
  });
};

export const getAgreementById = async (agreementId) => {
  const agreement = await Agreement.findById(agreementId);
  if (!agreement) throw new Error("Agreement not found");
  return {
    _id: agreement._id,
    title: agreement.title,
    description: agreement.description,
    icon: agreement.icon,
    riskLevel: agreement.riskLevel,
    category: agreement.category,
    keyTerms: agreement.keyTerms,
    studyContent: agreement.studyContent,
    redFlags: agreement.redFlags,
    xpReward: agreement.xpReward,
    quiz: agreement.quiz.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      // correctIndex NOT sent
    })),
  };
};

export const submitAgreementQuiz = async (userId, agreementId, answers) => {
  const agreement = await Agreement.findById(agreementId);
  if (!agreement) throw new Error("Agreement not found");

  let correct = 0;
  const results = agreement.quiz.map((q) => {
    const answer = answers.find((a) => a.questionId === q._id.toString());
    const selectedIndex = answer ? answer.selectedIndex : -1;
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) correct++;
    return { questionId: q._id, isCorrect, correctIndex: q.correctIndex, explanation: q.explanation };
  });

  const scorePercent = Math.round((correct / agreement.quiz.length) * 100);
  const passed = scorePercent >= 60;

  const progress = await getOrCreateProgress(userId);
  const alreadyMastered = progress.masteredAgreements.some(
    (m) => m.agreementId.toString() === agreementId
  );

  if (passed && !alreadyMastered) {
    progress.masteredAgreements.push({ agreementId, quizScore: scorePercent });
    progress.xp += agreement.xpReward;
    progress.level = Math.floor(progress.xp / AGREEMENT_XP_PER_LEVEL) + 1;
    await progress.save();
    await rewardUser(userId, "LESSON_COMPLETED", "lessonsCompleted");
  }

  return { score: scorePercent, correct, total: agreement.quiz.length, passed, results };
};

export const getAgreementStats = async (userId) => {
  const progress = await getOrCreateProgress(userId);
  const allAgreements = await Agreement.find({ isActive: true });
  const highRiskCount = allAgreements.filter((a) => a.riskLevel === "High").length;
  const masteredHighRisk = progress.masteredAgreements.filter((m) => {
    const agreement = allAgreements.find((a) => a._id.toString() === m.agreementId.toString());
    return agreement?.riskLevel === "High";
  }).length;

  return {
    mastered: progress.masteredAgreements.length,
    total: allAgreements.length,
    highRiskTotal: highRiskCount,
    highRiskMastered: masteredHighRisk,
    progress: Math.round((progress.masteredAgreements.length / allAgreements.length) * 100),
    xp: progress.xp,
    level: progress.level,
    xpToNextLevel: progress.level * AGREEMENT_XP_PER_LEVEL - progress.xp,
  };
};