import { getAllAgreements, getAgreementById, submitAgreementQuiz, getAgreementStats } from "./agreements.service.js";

// GET /api/agreements
export const listAgreements = async (req, res) => {
  try {
    const data = await getAllAgreements(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/agreements/stats
export const agreementStats = async (req, res) => {
  try {
    const data = await getAgreementStats(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/agreements/:agreementId
export const getAgreement = async (req, res) => {
  try {
    const data = await getAgreementById(req.params.agreementId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// POST /api/agreements/:agreementId/quiz
// Body: { answers: [{ questionId, selectedIndex }] }
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "answers array is required" });
    }
    const data = await submitAgreementQuiz(req.user._id, req.params.agreementId, answers);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};