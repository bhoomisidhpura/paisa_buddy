import "./config/env.js";
import express from "express";
import cors from "cors";
import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import transactionRoutes from "./modules/transaction/transaction.routes.js";
import gamificationRoutes from "./modules/gamification/gamification.routes.js";
import portfolioRoutes from "./modules/portfolio/portfolio.routes.js";
import learningRoutes from "./modules/learning/learning.routes.js";
import fraudDetectionRoutes from "./modules/fraudDetection/fraudDetection.routes.js";
import fraudAwarenessRoutes from "./modules/fraudAwareness/fraudAwareness.routes.js";
import budgetRoutes from "./modules/budget/budget.routes.js";
import schemeRoutes from "./modules/scheme-hunt/scheme.routes.js";
import swipeRoutes from "./modules/swipe/swipe.routes.js";
import agreementRoutes from "./modules/agreements/agreements.routes.js";
import loanRoutes from "./modules/loans/loans.routes.js";

import { connectDB } from "./config/db.js";

const app = express();

// Middleware
app.use(cors({
  origin: ["https://paisa-buddy-zeta.vercel.app", "http://localhost:5174"],
  credentials: true,
}));                                                                                                                                                                                              
app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/fraud-detection", fraudDetectionRoutes);
app.use("/api/fraud-awareness", fraudAwarenessRoutes);
app.use("/api/scheme-hunt", schemeRoutes);
app.use("/api/swipe", swipeRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/loans", loanRoutes);

// Start server
const PORT = process.env.PORT || 5179;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});