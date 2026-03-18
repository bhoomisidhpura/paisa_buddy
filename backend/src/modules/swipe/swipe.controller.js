import { getNextCard, submitSwipe, getSwipeStats } from "./swipe.service.js";

// GET /api/swipe/next
export const nextCard = async (req, res) => {
  try {
    const data = await getNextCard(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/swipe/:cardId
// Body: { choice: "approve" | "reject" }
export const swipe = async (req, res) => {
  try {
    const { choice } = req.body;
    if (!choice || !["approve", "reject"].includes(choice)) {
      return res.status(400).json({ message: "choice must be 'approve' or 'reject'" });
    }
    const data = await submitSwipe(req.user._id, req.params.cardId, choice);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/swipe/stats
export const stats = async (req, res) => {
  try {
    const data = await getSwipeStats(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};