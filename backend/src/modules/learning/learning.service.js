import { LearningModule } from "./learning.model.js";
import { UserProgress } from "./userProgress.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

// --- Get or create user progress doc ---
const getOrCreateProgress = async (userId) => {
  let progress = await UserProgress.findOne({ user: userId });
  if (!progress) {
    progress = await UserProgress.create({ user: userId });
  }
  return progress;
};

// --- Get all modules with user's progress overlaid ---
export const getAllModules = async (userId) => {
  const modules = await LearningModule.find({ isActive: true }).sort("order");
  const progress = await getOrCreateProgress(userId);

  return modules.map((mod) => {
    const modProgress = progress.moduleProgress.find(
      (mp) => mp.moduleId.toString() === mod._id.toString()
    );

    const totalLessons = mod.lessons.length;
    const completedLessons = modProgress ? modProgress.lessonsCompleted.length : 0;
    const completionPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      _id: mod._id,
      title: mod.title,
      description: mod.description,
      icon: mod.icon,
      difficulty: mod.difficulty,
      xpReward: mod.xpReward,
      totalLessons,
      completedLessons,
      completionPercent,
      quizCompleted: modProgress ? modProgress.quizCompleted : false,
      quizScore: modProgress ? modProgress.quizScore : 0,
      isCompleted: modProgress ? !!modProgress.completedAt : false,
      xpEarned: modProgress ? modProgress.xpEarned : 0,
    };
  });
};

// --- Get a single module with lessons (no quiz answers exposed) ---
export const getModuleById = async (moduleId, userId) => {
  const mod = await LearningModule.findById(moduleId);
  if (!mod) throw new Error("Module not found");

  const progress = await getOrCreateProgress(userId);
  const modProgress = progress.moduleProgress.find(
    (mp) => mp.moduleId.toString() === moduleId
  );

  const completedLessonIds = modProgress
    ? modProgress.lessonsCompleted.map((l) => l.lessonId.toString())
    : [];

  const lessons = mod.lessons
    .sort((a, b) => a.order - b.order)
    .map((lesson) => ({
      _id: lesson._id,
      title: lesson.title,
      content: lesson.content,
      duration: lesson.duration,
      order: lesson.order,
      isCompleted: completedLessonIds.includes(lesson._id.toString()),
    }));

  return {
    _id: mod._id,
    title: mod.title,
    description: mod.description,
    icon: mod.icon,
    difficulty: mod.difficulty,
    xpReward: mod.xpReward,
    lessons,
    hasQuiz: mod.quiz.length > 0,
    quizCompleted: modProgress ? modProgress.quizCompleted : false,
    quizScore: modProgress ? modProgress.quizScore : 0,
  };
};

// --- Mark a lesson as complete ---
export const completeLesson = async (userId, moduleId, lessonId) => {
  const mod = await LearningModule.findById(moduleId);
  if (!mod) throw new Error("Module not found");

  const lesson = mod.lessons.id(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  const progress = await getOrCreateProgress(userId);

  // Find or create module progress entry
  let modProgress = progress.moduleProgress.find(
    (mp) => mp.moduleId.toString() === moduleId
  );
  if (!modProgress) {
    progress.moduleProgress.push({ moduleId, lessonsCompleted: [] });
    modProgress = progress.moduleProgress[progress.moduleProgress.length - 1];
  }

  // Check if already completed
  const alreadyDone = modProgress.lessonsCompleted.some(
    (l) => l.lessonId.toString() === lessonId
  );
  if (alreadyDone) {
    return { message: "Lesson already completed", alreadyCompleted: true };
  }

  // Mark lesson complete
  modProgress.lessonsCompleted.push({ lessonId });
  progress.totalLessonsCompleted += 1;

  // Check if entire module is now complete (all lessons + quiz if exists)
  const allLessonsDone =
    modProgress.lessonsCompleted.length === mod.lessons.length;
  const quizDone = mod.quiz.length === 0 || modProgress.quizCompleted;
  let moduleCompleted = false;

  if (allLessonsDone && quizDone && !modProgress.completedAt) {
    modProgress.completedAt = new Date();
    modProgress.xpEarned = mod.xpReward;
    progress.totalXpEarned += mod.xpReward;
    progress.totalModulesCompleted += 1;
    moduleCompleted = true;
  }

  await progress.save();

  // Reward gamification
  const reward = await rewardUser(userId, "LESSON_COMPLETED", "lessonsCompleted");

  return {
    message: "Lesson completed!",
    alreadyCompleted: false,
    moduleCompleted,
    reward,
  };
};

// --- Get quiz questions (without correct answers) ---
export const getQuiz = async (moduleId) => {
  const mod = await LearningModule.findById(moduleId);
  if (!mod) throw new Error("Module not found");
  if (mod.quiz.length === 0) throw new Error("No quiz for this module");

  return mod.quiz.map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    // correctIndex NOT sent to frontend
  }));
};

// --- Submit quiz answers ---
export const submitQuiz = async (userId, moduleId, answers) => {
  // answers: [{ questionId, selectedIndex }]
  const mod = await LearningModule.findById(moduleId);
  if (!mod) throw new Error("Module not found");
  if (mod.quiz.length === 0) throw new Error("No quiz for this module");

  // Grade the quiz
  let correct = 0;
  const results = mod.quiz.map((q) => {
    const answer = answers.find((a) => a.questionId === q._id.toString());
    const selectedIndex = answer ? answer.selectedIndex : -1;
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) correct++;
    return {
      questionId: q._id,
      question: q.question,
      selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const scorePercent = Math.round((correct / mod.quiz.length) * 100);
  const passed = scorePercent >= 60; // pass threshold: 60%

  const progress = await getOrCreateProgress(userId);
  let modProgress = progress.moduleProgress.find(
    (mp) => mp.moduleId.toString() === moduleId
  );
  if (!modProgress) {
    progress.moduleProgress.push({ moduleId, lessonsCompleted: [] });
    modProgress = progress.moduleProgress[progress.moduleProgress.length - 1];
  }

  modProgress.quizAttempts += 1;

  // Only update score if better than previous
  if (scorePercent > modProgress.quizScore) {
    modProgress.quizScore = scorePercent;
  }

  if (passed && !modProgress.quizCompleted) {
    modProgress.quizCompleted = true;
    progress.totalQuizzesCompleted += 1;

    // Check if module is now fully complete
    const allLessonsDone =
      modProgress.lessonsCompleted.length === mod.lessons.length;
    if (allLessonsDone && !modProgress.completedAt) {
      modProgress.completedAt = new Date();
      modProgress.xpEarned = mod.xpReward;
      progress.totalXpEarned += mod.xpReward;
      progress.totalModulesCompleted += 1;
    }
  }

  await progress.save();

  // Reward gamification
  const reward = await rewardUser(userId, "QUIZ_COMPLETED", "quizzesCompleted");

  return {
    score: scorePercent,
    correct,
    total: mod.quiz.length,
    passed,
    results,
    reward,
  };
};

// --- Get user's overall learning stats ---
export const getLearningStats = async (userId) => {
  const progress = await getOrCreateProgress(userId);
  const totalModules = await LearningModule.countDocuments({ isActive: true });

  const overallPercent =
    totalModules > 0
      ? Math.round((progress.totalModulesCompleted / totalModules) * 100)
      : 0;

  return {
    totalLessonsCompleted: progress.totalLessonsCompleted,
    totalModulesCompleted: progress.totalModulesCompleted,
    totalQuizzesCompleted: progress.totalQuizzesCompleted,
    totalXpEarned: progress.totalXpEarned,
    overallPercent,
    totalModules,
  };
};