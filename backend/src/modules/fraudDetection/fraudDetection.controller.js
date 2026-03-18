import { scanMessage, getScanHistory } from "./fraudDetection.service.js";

// POST /api/fraud-detection/scan
// Body: { message: "suspicious text here" }
export const scan = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }
    const result = await scanMessage(req.user._id, message);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/fraud-detection/history
export const history = async (req, res) => {
  try {
    const scans = await getScanHistory(req.user._id);
    res.status(200).json({ success: true, data: scans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};