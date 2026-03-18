import mongoose from "mongoose";

// --- Quiz Question Schema ---
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // array of 3-4 options
  correctIndex: { type: Number, required: true }, // index of correct option
  explanation: { type: String, default: "" }, // shown after answering
});

// --- Lesson Schema ---
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // markdown or plain text
  duration: { type: Number, default: 5 }, // estimated minutes
  order: { type: Number, required: true },
});

// --- Learning Module Schema ---
const learningModuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "📚" },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    xpReward: { type: Number, default: 200 }, // XP on completion
    order: { type: Number, required: true }, // display order
    lessons: [lessonSchema],
    quiz: [questionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const LearningModule = mongoose.model("LearningModule", learningModuleSchema);