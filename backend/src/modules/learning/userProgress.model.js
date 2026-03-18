import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  completedAt: { type: Date, default: Date.now },
});

const moduleProgressSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningModule",
    required: true,
  },
  lessonsCompleted: [lessonProgressSchema],
  quizCompleted: { type: Boolean, default: false },
  quizScore: { type: Number, default: 0 }, // percentage
  quizAttempts: { type: Number, default: 0 },
  completedAt: { type: Date, default: null }, // set when all lessons + quiz done
  xpEarned: { type: Number, default: 0 },
});

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    moduleProgress: [moduleProgressSchema],
    totalXpEarned: { type: Number, default: 0 },
    totalLessonsCompleted: { type: Number, default: 0 },
    totalModulesCompleted: { type: Number, default: 0 },
    totalQuizzesCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);