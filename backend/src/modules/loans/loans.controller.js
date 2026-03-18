import { getCreditDashboard, updateCreditScore, saveEMICalculation, calculateEMI, LOAN_TYPES } from "./loans.service.js";

// GET /api/loans
export const dashboard = async (req, res) => {
  try {
    const data = await getCreditDashboard(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/loans/types
export const loanTypes = async (req, res) => {
  res.status(200).json({ success: true, data: LOAN_TYPES });
};

// PUT /api/loans/credit-score
// Body: { score: 720 }
export const setCreditScore = async (req, res) => {
  try {
    const { score } = req.body;
    if (!score) return res.status(400).json({ message: "score is required" });
    const data = await updateCreditScore(req.user._id, parseInt(score));
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/loans/emi-calculator
// Body: { loanType: "home", principal: 1000000, interestRate: 8.5, tenureMonths: 240 }
export const emiCalculator = async (req, res) => {
  try {
    const { loanType, principal, interestRate, tenureMonths, save } = req.body;
    if (!principal || !interestRate || !tenureMonths) {
      return res.status(400).json({ message: "principal, interestRate, and tenureMonths are required" });
    }
    // If save=true, persist to DB; otherwise just calculate
    let result;
    if (save) {
      result = await saveEMICalculation(req.user._id, { loanType, principal, interestRate, tenureMonths });
    } else {
      result = calculateEMI(principal, interestRate, tenureMonths);
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};