import { CreditProfile } from "./loans.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

const LOANS_XP_PER_LEVEL = 300;

// --- Static loan types data ---
export const LOAN_TYPES = [
  {
    id: "personal",
    name: "Personal Loan",
    icon: "👤",
    description: "Unsecured loan for any personal need",
    riskLevel: "High",
    interestRateMin: 10,
    interestRateMax: 24,
    maxTenureYears: 5,
    maxAmount: 4000000,
    warning: "High Interest — Use Carefully!",
    tips: ["Only take for emergencies", "Compare rates across 3+ lenders", "Check for prepayment charges"],
  },
  {
    id: "home",
    name: "Home Loan",
    icon: "🏠",
    description: "Long-term loan for property purchase",
    riskLevel: "Medium",
    interestRateMin: 7,
    interestRateMax: 9.5,
    maxTenureYears: 30,
    maxAmount: 100000000,
    warning: null,
    tips: ["Compare floating vs fixed rates", "Tax benefit under Section 24b (₹2L) and 80C (₹1.5L)", "Aim for 20% down payment"],
  },
  {
    id: "car",
    name: "Car Loan",
    icon: "🚗",
    description: "Secured loan for vehicle purchase",
    riskLevel: "Medium",
    interestRateMin: 7,
    interestRateMax: 12,
    maxTenureYears: 7,
    maxAmount: 10000000,
    warning: null,
    tips: ["Car is a depreciating asset", "Keep EMI under 15% of income", "Consider used cars for better value"],
  },
  {
    id: "education",
    name: "Education Loan",
    icon: "🎓",
    description: "Loan for higher education expenses",
    riskLevel: "Low",
    interestRateMin: 7.5,
    interestRateMax: 14,
    maxTenureYears: 15,
    maxAmount: 7500000,
    warning: null,
    tips: ["Interest deductible under Section 80E (no limit)", "Moratorium period = course + 1 year", "No collateral needed up to ₹4L"],
  },
  {
    id: "credit_card",
    name: "Credit Card",
    icon: "💳",
    description: "Revolving credit for purchases",
    riskLevel: "High",
    interestRateMin: 36,
    interestRateMax: 42,
    maxTenureYears: null,
    maxAmount: null,
    warning: "Never revolve credit card balance!",
    tips: ["Always pay full dues monthly", "Keep utilization below 30%", "Use for rewards, not loans"],
  },
];

// --- Credit score rating ---
export const getCreditRating = (score) => {
  if (score >= 800) return { rating: "Excellent", color: "green", benefits: ["Lowest interest rates", "All loans approved", "Premium credit cards", "Maximum negotiation power"] };
  if (score >= 750) return { rating: "Very Good", color: "blue", benefits: ["Very good rates", "Most loans approved", "Good credit cards", "Some negotiation room"] };
  if (score >= 700) return { rating: "Good", color: "yellow", benefits: ["Standard rates", "Most loans approved", "Basic credit cards", "Some negotiation room"] };
  if (score >= 650) return { rating: "Fair", color: "orange", benefits: ["Higher interest rates", "Some loans approved", "Limited credit options", "Low negotiation power"] };
  return { rating: "Poor", color: "red", benefits: ["Very high rates or rejection", "Limited loan access", "Secured cards only", "No negotiation power"] };
};

// --- EMI Calculator ---
export const calculateEMI = (principal, annualRate, tenureMonths) => {
  if (annualRate === 0) return { emi: principal / tenureMonths, totalPayment: principal, totalInterest: 0 };
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal,
    interestPercent: Math.round((totalInterest / totalPayment) * 100),
  };
};

// --- Get or create credit profile ---
const getOrCreateProfile = async (userId) => {
  let profile = await CreditProfile.findOne({ user: userId });
  if (!profile) profile = await CreditProfile.create({ user: userId });
  return profile;
};

// --- Get full credit dashboard ---
export const getCreditDashboard = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  const ratingInfo = profile.creditScore > 0 ? getCreditRating(profile.creditScore) : null;

  return {
    creditScore: profile.creditScore,
    rating: ratingInfo,
    level: profile.level,
    xp: profile.xp,
    xpToNextLevel: profile.level * LOANS_XP_PER_LEVEL - profile.xp,
    loanTypes: LOAN_TYPES,
    recentCalculations: profile.emiCalculations.slice(-5).reverse(),
  };
};

// --- Update credit score ---
export const updateCreditScore = async (userId, score) => {
  if (score < 300 || score > 900) throw new Error("Credit score must be between 300 and 900");
  const profile = await getOrCreateProfile(userId);
  profile.creditScore = score;
  profile.xp += 50;
  profile.level = Math.floor(profile.xp / LOANS_XP_PER_LEVEL) + 1;
  await profile.save();
  await rewardUser(userId, "LESSON_COMPLETED", "lessonsCompleted");
  return { creditScore: score, ...getCreditRating(score) };
};

// --- Calculate and save EMI ---
export const saveEMICalculation = async (userId, { loanType, principal, interestRate, tenureMonths }) => {
  const result = calculateEMI(principal, interestRate, tenureMonths);
  const profile = await getOrCreateProfile(userId);
  profile.emiCalculations.push({ loanType, principal, interestRate, tenureMonths, ...result });
  // Keep only last 20 calculations
  if (profile.emiCalculations.length > 20) {
    profile.emiCalculations = profile.emiCalculations.slice(-20);
  }
  profile.xp += 10;
  profile.level = Math.floor(profile.xp / LOANS_XP_PER_LEVEL) + 1;
  await profile.save();
  return result;
};