import { getTreasureMap, unlockScheme, submitSchemeQuiz, getHuntStats, getSchemeDetail } from "./scheme.service.js";

export const treasureMap = async (req, res) => {
  try {
    const data = await getTreasureMap(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getScheme = async (req, res) => {
  try {
    const data = await getSchemeDetail(req.user._id, req.params.schemeId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const unlock = async (req, res) => {
  try {
    const data = await unlockScheme(req.user._id, req.params.schemeId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const schemeQuiz = async (req, res) => {
  try {
    const { selectedIndex } = req.body;
    if (selectedIndex === undefined) {
      return res.status(400).json({ message: "selectedIndex is required" });
    }
    const data = await submitSchemeQuiz(req.user._id, req.params.schemeId, selectedIndex);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const stats = async (req, res) => {
  try {
    const data = await getHuntStats(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};